import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Stack
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  AutoFixHigh as MigrateIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as SuccessIcon
} from "@mui/icons-material";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { runNotesMigration } from "../utils/migration";
import toast from "react-hot-toast";

export const AdminPanelPage = () => {
  const [stats, setStats] = useState({ totalNotes: 0, publicNotes: 0, htmlMigrated: 0 });
  const [notesList, setNotesList] = useState([]);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, msg: "" });

  const fetchAdminStats = async () => {
    try {
      const snap = await getDocs(collection(db, "notes"));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotesList(docs);
      
      const totalNotes = docs.length;
      const publicNotes = docs.filter((d) => d.visibility === "public").length;
      const htmlMigrated = docs.filter((d) => d.isMigratedToHtml || /^<[a-z1-6][\s\S]*>/i.test(d.content?.trim() || "")).length;

      setStats({ totalNotes, publicNotes, htmlMigrated });
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleRunBatchMigration = async () => {
    setMigrating(true);
    try {
      const res = await runNotesMigration((cur, tot, msg) => {
        setProgress({ current: cur, total: tot, msg });
      });
      toast.success(`Batch migration finished! Converted ${res.converted} notes.`);
      await fetchAdminStats();
    } catch {
      toast.error("Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Admin Panel & System Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor system status, security sanitization, and run Markdown-to-HTML batch migrations.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<MigrateIcon />}
          onClick={handleRunBatchMigration}
          disabled={migrating}
          sx={{ borderRadius: 3, px: 3, fontWeight: 700 }}
        >
          Run Batch Markdown Migration
        </Button>
      </Box>

      {migrating && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            {progress.msg || "Migrating Firestore records..."}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress.total ? (progress.current / progress.total) * 100 : 0}
          />
        </Paper>
      )}

      {/* System Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Total Database Notes
              </Typography>
              <Typography variant="h3" fontWeight={800} color="primary.main">
                {stats.totalNotes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                HTML Clean Notes
              </Typography>
              <Typography variant="h3" fontWeight={800} color="success.main">
                {stats.htmlMigrated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, p: 1 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Public Shared Notes
              </Typography>
              <Typography variant="h3" fontWeight={800} color="info.main">
                {stats.publicNotes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notes Inventory Data Table */}
      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden", p: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={2} px={1}>
          Firestore Document Records
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Note ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Format</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Visibility</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Views</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notesList.slice(0, 10).map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{n.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{n.title || "Untitled"}</TableCell>
                  <TableCell>
                    <Chip
                      label={n.isMigratedToHtml || /^<[a-z1-6][\s\S]*>/i.test(n.content?.trim() || "") ? "HTML" : "Markdown"}
                      color={n.isMigratedToHtml || /^<[a-z1-6][\s\S]*>/i.test(n.content?.trim() || "") ? "success" : "warning"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={n.visibility || "private"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{n.viewCount || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminPanelPage;

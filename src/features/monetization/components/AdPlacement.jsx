"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, BadgeCheck, Plus } from "lucide-react";
import { useMonetization } from "@/context/MonetizationContext";
import { usePlatformSettings } from "@/context/PlatformSettingsContext";
import { getCreatorMonetization } from "@/features/monetization/services/monetizationService";
import { getProviderById } from "@/features/monetization/providers";
import ProviderWizardModal from "./ProviderWizardModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Sandboxed AdPlacement component.
 * Safely renders creator ad units or empty state with "Connect Ad Provider" prompt.
 */
export const AdPlacement = ({
  placement = "above_article",
  slotId = "",
  isPreview = false,
  creatorUid = null,
  authorId = null,
}) => {
  const { monetizationState: ownMonetizationState } = useMonetization();
  const { settings } = usePlatformSettings();
  const [creatorMonetization, setCreatorMonetization] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const targetUid = creatorUid || authorId;

  useEffect(() => {
    let isMounted = true;
    if (targetUid) {
      getCreatorMonetization(targetUid)
        .then((data) => {
          if (isMounted) setCreatorMonetization(data);
        })
        .catch(() => {
          if (isMounted) setCreatorMonetization(null);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [targetUid]);

  if (settings?.advertisements?.enableAds === false) return null;
  if (targetUid && settings?.creatorMonetization?.enableCreatorMonetization === false) return null;

  const activeMonetization = targetUid ? creatorMonetization : ownMonetizationState;
  const isEnabled = isPreview || activeMonetization?.placements?.[placement];
  const activeProviderId = activeMonetization?.activeProviderId;
  const isVerified = isPreview || activeMonetization?.status === "verified";
  const provider = getProviderById(activeProviderId);

  if (!activeProviderId && !isPreview) {
    return null;
  }

  if (!isEnabled && !isPreview) return null;

  return (
    <>
      <div className="relative my-5 overflow-hidden rounded-2xl border border-border bg-muted/40 p-4 text-center">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-muted-foreground/70">
            SPONSORED ADVERTISEMENT
          </span>
          <Badge variant="outline" className="h-5 gap-1 text-[11px]">
            <ShieldCheck className="size-3.5" />
            {provider ? provider.name : "No Provider Connected"}
          </Badge>
        </div>

        <div className="flex min-h-[100px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/60 p-4">
          {!activeProviderId ? (
            <div className="py-1">
              <p className="mb-1.5 text-sm font-bold text-muted-foreground">
                No Advertising Provider Connected
              </p>
              <p className="mb-3 text-xs text-muted-foreground/70">
                Connect AdSense, Ad Manager, Media.net, Carbon, or a custom network to show ads.
              </p>
              <Button size="sm" onClick={() => setWizardOpen(true)}>
                <Plus />
                Connect Ad Provider
              </Button>
            </div>
          ) : isVerified ? (
            <div className="w-full">
              <p className="text-sm font-bold text-primary">
                {provider?.name || "Active Ad Unit"} ({placement})
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Publisher: {activeMonetization?.publisherId} · Slot: {slotId || "default_slot"}
              </p>
            </div>
          ) : (
            <div>
              <Badge variant="outline" className="mb-1.5 gap-1 border-amber-400 text-amber-600 dark:text-amber-400">
                <BadgeCheck className="size-3.5" />
                Pending Creator Verification
              </Badge>
              <p className="text-xs text-muted-foreground">
                Ads will activate automatically once platform verification completes.
              </p>
            </div>
          )}
        </div>
      </div>

      <ProviderWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  );
};

export default AdPlacement;

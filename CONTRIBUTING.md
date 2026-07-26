# Contributing to OpenNotes

Thank you for your interest in contributing to **OpenNotes**! We welcome contributions from developers of all skill levels.

## Code of Conduct

Please be respectful and helpful to others in issue discussions and pull requests.

## How to Contribute

### 1. Reporting Bugs
- Search existing GitHub Issues to see if the bug has already been reported.
- If not, open a new Issue describing the steps to reproduce the problem, expected behavior, and screenshots if applicable.

### 2. Suggesting Enhancements
- Feature requests are welcome! Open a new Issue outlining the proposal and design rationale.

### 3. Submitting Pull Requests

1. **Fork the Repository**:
   Click the **Fork** button at the top right of the repository.

2. **Clone your Fork**:
   ```bash
   git clone https://github.com/your-username/open-notes.git
   cd open-notes
   ```

3. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/my-new-feature
   ```

4. **Install Dependencies & Start Dev Server**:
   ```bash
   npm install
   npm run dev
   ```

5. **Run Lint Checks**:
   ```bash
   npm run lint
   ```

6. **Test Production Build**:
   ```bash
   npm run build
   ```

7. **Commit & Push**:
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   git push origin feat/my-new-feature
   ```

8. **Open a Pull Request**:
   Navigate to the main repository on GitHub and click **New Pull Request**.

## Commit Conventions

We follow Conventional Commits format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Formatting changes
- `refactor:` Code structure changes without feature modification
- `test:` Adding or fixing tests

Thank you for building OpenNotes with us!

# Setting up GPG and SSH Keys for GitHub

This guide will walk you through the process of setting up GPG signing for your commits and SSH authentication for GitHub.

## GPG Setup

### 1. Check GPG Installation

First, verify if GPG is installed on your system:

```bash
gpg --version
```

If GPG is not installed, you can install it using your package manager:

For Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install gnupg2
```

For Red Hat/CentOS/Fedora:

```bash
sudo dnf install gnupg2
```

For macOS (using Homebrew):

```bash
brew install gnupg
```

For Windows:

1. Download Gpg4win from the official website: https://www.gpg4win.org/
2. Run the installer and follow the installation wizard
   - At minimum, ensure "GnuPG" is selected during installation
   - Kleopatra (GUI for GPG) is optional but recommended for Windows users
3. After installation, open Git Bash or Command Prompt and verify:

```bash
gpg --version
```

Note: If using Git Bash on Windows and the `gpg` command is not found, you might need to add the Gpg4win binary to your PATH:

1. Default location is: `C:\Program Files (x86)\GnuPG\bin`
2. Add this path to your system's PATH environment variable

Verify the installation:

```bash
gpg --version
```

### 2. Check for Existing GPG Keys

Before generating a new key, check if you already have any GPG keys:

```bash
gpg --list-secret-keys --keyid-format=long
```

The output will look something like this if you have existing keys:

```
/Users/username/.gnupg/pubring.kbx
-----------------------------------
sec   ed25519/1234567890ABCDEF 2023-01-01 [SC]
      FEDCBA0987654321FEDCBA0987654321FEDCBA09
uid                 [ultimate] Your Name <your.email@example.com>
ssb   cv25519/ABCDEF1234567890 2023-01-01 [E]
```

If no keys are listed, or if you want to create a new one for GitHub, proceed to generating a new key.

### 3. Generate a New GPG Key

If GPG is installed, generate a new key:

```bash
gpg --full-generate-key
```

When prompted:

1. Choose key type: Select `9` for "ECC (sign and encrypt)"
2. Choose curve: Select `1` for "Curve 25519"
3. Set expiration: Enter `0` for a key that never expires
4. Enter your real name and email address (use your GitHub email)
5. Enter a secure passphrase

### 4. List Your GPG Keys

To view your GPG keys:

```bash
gpg --list-secret-keys --keyid-format=long
```

### 5. Export Your GPG Public Key

The GPG key pair consists of a private key (which stays on your computer) and a public key. GitHub needs your public key to verify that commits signed with your private key actually came from you. This is how the signature verification process works:

1. You sign a commit with your private key
2. GitHub uses your public key to verify the signature
3. If the verification succeeds, GitHub marks the commit as "Verified"

Export your GPG public key (replace KEY_ID with your key ID):

```bash
gpg --armor --export YOUR_KEY_ID
```

The `--armor` option outputs the key in ASCII format, which is required for pasting into GitHub.

### 6. Add GPG Key to GitHub

1. Copy the entire GPG key block (including BEGIN and END lines)
2. Go to GitHub.com → Settings
3. Click "SSH and GPG keys" in the sidebar
4. Click "New GPG key"
5. Paste your key and click "Add GPG key"

### 7. Configure Git to Use GPG

Configure Git to use your GPG key for signing commits:

```bash
# For a specific repository
git config user.signingkey YOUR_KEY_ID
git config commit.gpgsign true

# Or globally (optional)
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

### 8. Verify Git Configuration

To check all local configurations for your repository:

```bash
git config --local --list
```

Verify that the following settings are present and correct:

1. `user.signingkey` should match your GPG key ID
2. `commit.gpgsign` should be set to `true`
3. `user.email` should match the email used in your GPG key
4. `user.name` should be properly set
5. `remote.origin.url` should start with `git@github.com:` (if using SSH)

Example of correct configuration:

```
user.email=your.email@example.com
user.name=Your Name
user.signingkey=YOUR_GPG_KEY_ID
commit.gpgsign=true
remote.origin.url=git@github.com:organization/repository.git
```

If any settings are missing or incorrect, you can set them using:

```bash
git config user.email "your.email@example.com"
git config user.name "Your Name"
git config user.signingkey YOUR_GPG_KEY_ID
git config commit.gpgsign true
```

Note: If your `remote.origin.url` starts with `https://` instead of `git@github.com:`, you need to change it to use SSH. Follow these steps:

1. Check your current remote URL:

```bash
git remote -v
```

2. If it shows HTTPS URL (starts with `https://`), change it to SSH:

```bash
git remote set-url origin git@github.com:ORGANIZATION/REPOSITORY.git
```

3. Verify the change:

```bash
git remote -v
```

The URLs should now start with `git@github.com:` instead of `https://`.

## SSH Setup

### 1. Check for Existing SSH Keys

Before generating a new SSH key, check if you already have any keys:

```bash
ls -la ~/.ssh
```

You might see files like:

- `id_rsa` or `id_ed25519` (private key)
- `id_rsa.pub` or `id_ed25519.pub` (public key)
- `known_hosts` (list of recognized remote servers)
- `authorized_keys` (keys that can access this machine)

If you see files like `id_ed25519` or `id_rsa`, you already have SSH keys. You can:

1. Use your existing keys (skip to step 3), or
2. Create new keys if you prefer (continue with step 2)

To view the contents of an existing public key:

```bash
cat ~/.ssh/id_ed25519.pub   # for Ed25519 keys
# or
cat ~/.ssh/id_rsa.pub       # for RSA keys
```

### 2. Generate SSH Key

If you need to generate a new key:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

When prompted:

1. Press Enter to accept the default file location
2. Enter a secure passphrase (recommended)

### 3. View Your SSH Public Key

Display your public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

### 4. Add SSH Key to GitHub

1. Copy your SSH public key (the entire line)
2. Go to GitHub.com → Settings
3. Click "SSH and GPG keys" in the sidebar
4. Click "New SSH key"
5. Add a descriptive title
6. Paste your key and click "Add SSH key"

### 5. Configure Repository to Use SSH

First, check your current remote URL:

```bash
git remote -v
```

If you see a URL starting with `https://`, change it to SSH:

```bash
# Format: git remote set-url origin git@github.com:ORGANIZATION/REPOSITORY.git
git remote set-url origin git@github.com:USERNAME/REPOSITORY.git
```

Verify the change:

```bash
git remote -v
```

The URLs should now start with `git@github.com:` instead of `https://`.

### 6. SAML SSO Authorization (if required)

You'll know if your organization uses SAML SSO when:

1. You try to push and get this error message:

```
ERROR: The 'ORGANIZATION' organization has enabled or enforced SAML SSO.
To access this repository, you must use the HTTPS remote with a personal access token
or SSH with an SSH key and passphrase that has been authorized for this organization.
Visit https://docs.github.com/articles/authenticating-to-a-github-organization-with-saml-single-sign-on/ for more information.
```

2. Or when you visit the organization's GitHub page, you see a message about SAML SSO authentication being required.

If your organization uses SAML SSO, follow these steps:

1. Go to GitHub.com → Settings
2. Click "SSH and GPG keys"
3. Find your SSH key
4. Click "Configure SSO"
5. Click "Authorize" next to your organization
6. Complete the SAML SSO authentication process

## Testing Your Setup

### Test GPG Signing

Make a commit to test GPG signing:

```bash
git commit -m "Test signed commit"
```

You should be prompted for your GPG passphrase.

### Test SSH Connection

Push to test SSH authentication:

```bash
git push --force-with-lease
```

The first time you connect, you'll be asked to verify GitHub's host key fingerprint.

## Troubleshooting

- If pushing fails with "permission denied", ensure your SSH key is properly added to GitHub and authorized for your organization
- If commits aren't being signed, verify your GPG key is properly configured in Git
- For organization access issues, ensure your SSH key is authorized through SAML SSO

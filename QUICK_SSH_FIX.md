# Quick SSH Key Fix

## 🚨 Error: `ssh: no key found` or `ssh: unable to authenticate`

### Most Common Cause: Key Has a Passphrase

GitHub Actions **CANNOT** use SSH keys with passphrases. You must regenerate the key without a passphrase.

## ⚡ Quick Fix (5 minutes)

### Step 1: Generate New Key (NO PASSPHRASE)

```bash
# Generate key WITHOUT passphrase (the -N "" is critical!)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# When prompted, just press Enter (don't enter a passphrase)
```

### Step 2: Copy Public Key to Server

```bash
# Copy public key to your server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server-ip

# Or manually:
# 1. Display public key
cat ~/.ssh/github_deploy.pub

# 2. SSH into server and add it:
ssh user@your-server-ip
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Get Private Key for GitHub

```bash
# Display the private key (copy ENTIRE output)
cat ~/.ssh/github_deploy
```

**Copy the ENTIRE output**, including:

- `-----BEGIN OPENSSH PRIVATE KEY-----` (or `-----BEGIN RSA PRIVATE KEY-----`)
- All the encoded lines in the middle
- `-----END OPENSSH PRIVATE KEY-----` (or `-----END RSA PRIVATE KEY-----`)

### Step 4: Update GitHub Secret

1. Go to: **Repository → Settings → Secrets and variables → Actions**
2. Find `DEPLOY_SSH_KEY` secret
3. Click **Update**
4. **Delete the old value completely**
5. Paste the NEW private key (from Step 3)
6. **Make sure there are NO extra spaces** at the beginning or end
7. Click **Update secret**

### Step 5: Test Connection

```bash
# Test locally first
ssh -i ~/.ssh/github_deploy user@your-server-ip

# If this works, the GitHub Actions should work too
```

## ✅ Verification Checklist

- [ ] Key generated with `-N ""` (no passphrase)
- [ ] Public key added to server's `~/.ssh/authorized_keys`
- [ ] Can SSH into server using the key locally
- [ ] Private key copied to GitHub secret `DEPLOY_SSH_KEY`
- [ ] Key includes `-----BEGIN` and `-----END` lines
- [ ] No extra whitespace in GitHub secret

## 🔍 Still Not Working?

### Check 1: Key Format in GitHub

The key in GitHub secret should look exactly like this (no extra spaces):

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdz
(many lines)
-----END OPENSSH PRIVATE KEY-----
```

### Check 2: Server Permissions

On your server, run:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Check 3: Test Manually

```bash
# Test SSH connection
ssh -v -i ~/.ssh/github_deploy user@your-server-ip

# Look for: "Authenticated to server..."
```

If manual test works but GitHub Actions doesn't, the issue is with the GitHub secret format.

## 📝 One-Liner Fix

Run this complete fix script:

```bash
# Generate new key, copy to server, and display for GitHub
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N "" && \
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server-ip && \
echo "=== PRIVATE KEY FOR GITHUB SECRET ===" && \
cat ~/.ssh/github_deploy
```

Replace `user@your-server-ip` with your actual server details.

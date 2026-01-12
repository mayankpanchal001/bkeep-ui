# SSH Key Troubleshooting Guide

## Common Error: `ssh: no key found` or `ssh: unable to authenticate`

This error occurs when the SSH key in GitHub Secrets is not properly formatted or configured.

## 🔍 Diagnosis Steps

### 1. Check SSH Key Format in GitHub Secrets

The SSH key must:
- ✅ Start with `-----BEGIN` (exactly 5 dashes)
- ✅ End with `-----END` (exactly 5 dashes)
- ✅ Include the entire key content (all lines)
- ✅ Have no extra whitespace at the beginning or end
- ✅ Use proper line breaks (newlines)

### 2. Verify Key Format

**Correct format:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdz
c2gtcnNhAAAAAwEAAQAAAQEAy...
(many lines)
...xyz123
-----END OPENSSH PRIVATE KEY-----
```

**OR for RSA keys:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAy...
(many lines)
...xyz123
-----END RSA PRIVATE KEY-----
```

## 🛠️ Fix Steps

### Step 1: Regenerate SSH Key (Recommended)

```bash
# Generate a new key without passphrase (required for GitHub Actions)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# Display the private key
cat ~/.ssh/github_deploy
```

**Important:** 
- Use `-N ""` to create a key WITHOUT a passphrase
- GitHub Actions cannot handle passphrase-protected keys interactively

### Step 2: Copy Key Correctly

1. **Display the key:**
   ```bash
   cat ~/.ssh/github_deploy
   ```

2. **Copy the ENTIRE output**, including:
   - The `-----BEGIN` line
   - All the encoded lines in the middle
   - The `-----END` line
   - No extra spaces or characters

3. **Paste into GitHub Secret:**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Edit `DEPLOY_SSH_KEY`
   - Paste the entire key (make sure there are no leading/trailing spaces)
   - Save

### Step 3: Add Public Key to Server

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server-ip

# Or manually:
# 1. Display public key
cat ~/.ssh/github_deploy.pub

# 2. SSH into server
ssh user@your-server-ip

# 3. Add to authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 4: Test Connection Locally

```bash
# Test SSH connection
ssh -i ~/.ssh/github_deploy -v user@your-server-ip

# If successful, you should see:
# "Authenticated to server..."
```

## 🔧 Alternative: Use SSH Key File Instead

If the key format continues to cause issues, you can use a different approach:

### Option 1: Use `key_path` instead of `key`

Update the workflow to use a file-based approach (requires storing key as a file in the repo - NOT RECOMMENDED for security).

### Option 2: Use `ssh_private_key` with proper formatting

Some versions of the action use `ssh_private_key` instead of `key`. Try updating the workflow:

```yaml
- name: Deploy to server via SSH
  uses: appleboy/ssh-action@v1.0.3
  with:
      host: ${{ secrets.DEPLOY_HOST }}
      username: ${{ secrets.DEPLOY_USER }}
      ssh_private_key: ${{ secrets.DEPLOY_SSH_KEY }}
      port: ${{ secrets.DEPLOY_PORT || 22 }}
```

## ✅ Verification Checklist

Before running the deployment, verify:

- [ ] SSH key starts with `-----BEGIN`
- [ ] SSH key ends with `-----END`
- [ ] No passphrase on the key (`-N ""` when generating)
- [ ] Public key is in server's `~/.ssh/authorized_keys`
- [ ] Server `~/.ssh/authorized_keys` has correct permissions (600)
- [ ] Server `~/.ssh` directory has correct permissions (700)
- [ ] Can SSH into server manually using the key
- [ ] GitHub secret `DEPLOY_SSH_KEY` contains the entire private key
- [ ] GitHub secret `DEPLOY_HOST` is set correctly
- [ ] GitHub secret `DEPLOY_USER` is set correctly

## 🐛 Common Issues

### Issue 1: Key has passphrase
**Error:** Authentication fails silently
**Fix:** Regenerate key without passphrase: `ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""`

### Issue 2: Extra whitespace in GitHub secret
**Error:** `ssh: no key found`
**Fix:** 
1. Copy key again, ensuring no leading/trailing spaces
2. Paste into GitHub secret
3. Save and retry

### Issue 3: Wrong key type
**Error:** `no supported methods remain`
**Fix:** Ensure server supports the key type (ed25519 is recommended, RSA 4096 is fallback)

### Issue 4: Public key not on server
**Error:** `Permission denied (publickey)`
**Fix:** Add public key to server's `~/.ssh/authorized_keys`

### Issue 5: Wrong permissions on server
**Error:** `Permission denied`
**Fix:** 
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## 📝 Quick Fix Script

Run this to regenerate and set up everything:

```bash
#!/bin/bash
# Quick fix script for SSH key issues

# Generate new key without passphrase
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

echo ""
echo "=== PUBLIC KEY (add to server) ==="
cat ~/.ssh/github_deploy.pub

echo ""
echo "=== PRIVATE KEY (add to GitHub Secret: DEPLOY_SSH_KEY) ==="
cat ~/.ssh/github_deploy

echo ""
echo "=== Next Steps ==="
echo "1. Copy the PUBLIC KEY above and add it to your server:"
echo "   ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server-ip"
echo ""
echo "2. Copy the PRIVATE KEY above and add it to GitHub:"
echo "   Repository → Settings → Secrets → DEPLOY_SSH_KEY"
echo ""
echo "3. Test connection:"
echo "   ssh -i ~/.ssh/github_deploy user@your-server-ip"
```

## 🔐 Security Note

- Never commit private keys to git
- Use a dedicated deploy user (not root)
- Rotate keys periodically
- Use ed25519 keys (more secure than RSA)

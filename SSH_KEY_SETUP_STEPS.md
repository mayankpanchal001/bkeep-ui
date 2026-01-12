# SSH Key Setup - Step by Step Guide

## 📍 Where to Do Each Step

### Step 1: Generate SSH Key (On Your LOCAL Machine)

**Location:** Your local computer (where you're developing)

**Open Terminal and run:**

```bash
# Navigate to your project (if not already there)
cd /Users/mayankpanchal/Workspaces/bkeep/frontend

# Generate the SSH key (this creates files in ~/.ssh/)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

# When prompted, just press Enter (don't type anything)
```

**What this does:**

- Creates `~/.ssh/github_deploy` (private key - keep secret!)
- Creates `~/.ssh/github_deploy.pub` (public key - safe to share)

---

### Step 2: Add Public Key to Your SERVER

**Location:** Your deployment server (the server where Docker will run)

**Option A: Using ssh-copy-id (Easiest)**

**On your LOCAL machine, run:**

```bash
# Replace with your actual server details
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server-ip

# Example:
# ssh-copy-id -i ~/.ssh/github_deploy.pub root@72.62.161.70
# or
# ssh-copy-id -i ~/.ssh/github_deploy.pub ubuntu@72.62.161.70
```

**Option B: Manual Method**

**1. On your LOCAL machine, display the public key:**

```bash
cat ~/.ssh/github_deploy.pub
```

**2. Copy the entire output** (it will look like: `ssh-ed25519 AAAA... github-actions-deploy`)

**3. SSH into your server:**

```bash
ssh user@your-server-ip
# Example: ssh root@72.62.161.70
```

**4. On the SERVER, run these commands:**

```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key
echo "PASTE_THE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

# Exit the server
exit
```

---

### Step 3: Test Connection (From Your LOCAL Machine)

**Location:** Your local computer

**Run:**

```bash
# Test SSH connection using the new key
ssh -i ~/.ssh/github_deploy user@your-server-ip

# Example:
# ssh -i ~/.ssh/github_deploy root@72.62.161.70
```

**If successful:** You should be logged into the server without entering a password.

**If it fails:** Check that you added the public key correctly in Step 2.

---

### Step 4: Add Private Key to GitHub Secrets

**Location:** GitHub website (in your browser)

**1. Get the private key from your LOCAL machine:**

```bash
# On your LOCAL machine, display the private key
cat ~/.ssh/github_deploy
```

**2. Copy the ENTIRE output** - it should look like:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdz
c2gtcnNhAAAAAwEAAQAAAQEAy...
(many lines of encoded text)
...xyz123
-----END OPENSSH PRIVATE KEY-----
```

**3. Go to GitHub:**

- Open your browser
- Go to: `https://github.com/mayankpanchal001/bkeep-frontend` (or your repo URL)
- Click: **Settings** (top menu)
- Click: **Secrets and variables** → **Actions** (left sidebar)

**4. Update the secret:**

- Find **`DEPLOY_SSH_KEY`** in the list
- Click **Update** (or create it if it doesn't exist)
- **Delete any existing value**
- **Paste the private key** you copied in step 2
- **Make sure there are NO extra spaces** at the beginning or end
- Click **Update secret**

**5. Verify other secrets are set:**

- `DEPLOY_HOST` - Your server IP (e.g., `72.62.161.70`)
- `DEPLOY_USER` - Your SSH username (e.g., `root` or `ubuntu`)
- `DEPLOY_PORT` - SSH port (usually `22`, optional)

---

## 📋 Quick Checklist

- [ ] **Step 1:** Generated key on local machine (`~/.ssh/github_deploy`)
- [ ] **Step 2:** Added public key to server (`~/.ssh/authorized_keys` on server)
- [ ] **Step 3:** Tested SSH connection from local machine (works without password)
- [ ] **Step 4:** Added private key to GitHub secret `DEPLOY_SSH_KEY`
- [ ] **Step 4:** Verified `DEPLOY_HOST` and `DEPLOY_USER` secrets are set

---

## 🎯 Summary: Where Each File Goes

| File                                | Location                              | Purpose                                |
| ----------------------------------- | ------------------------------------- | -------------------------------------- |
| `~/.ssh/github_deploy` (private)    | **Local machine**                     | Keep this secret, add to GitHub secret |
| `~/.ssh/github_deploy.pub` (public) | **Server** (`~/.ssh/authorized_keys`) | Allows GitHub Actions to connect       |
| Private key content                 | **GitHub Secrets** (`DEPLOY_SSH_KEY`) | Used by GitHub Actions workflow        |

---

## 🔍 Finding Your Server Details

**If you don't know your server IP or username:**

**Server IP:**

- Check your cloud provider dashboard (AWS, DigitalOcean, etc.)
- Or SSH into your server and run: `curl ifconfig.me`

**Username:**

- Common: `root`, `ubuntu`, `deploy`
- Or SSH into your server and run: `whoami`

---

## ✅ After Setup

Once all steps are complete:

1. Push a commit to trigger the deployment
2. Check GitHub Actions tab to see if deployment works
3. If it fails, check the workflow logs for specific errors

---

## 🆘 Need Help?

If you're stuck, check:

- `QUICK_SSH_FIX.md` - Quick troubleshooting
- `SSH_KEY_TROUBLESHOOTING.md` - Detailed troubleshooting
- `DEPLOYMENT_SECRETS.md` - Complete deployment guide

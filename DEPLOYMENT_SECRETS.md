# Deployment Secrets Setup Guide

This guide explains how to find and configure the deployment secrets for automatic Docker deployment.

## 🔐 Required Secrets

### 1. DEPLOY_HOST

**What it is:** The IP address or hostname of your server where you want to deploy the Docker container.

**How to find it:**

- **If you have a VPS/Cloud Server (AWS, DigitalOcean, Linode, etc.):**
    - Check your cloud provider's dashboard
    - Look for "Public IP" or "IPv4 Address"
    - Example: `72.62.161.70` or `server.example.com`

- **If you have a domain:**
    - Use your domain name (e.g., `deploy.yourdomain.com`)
    - Or use the server IP directly

- **To find it on your server:**
    ```bash
    # SSH into your server and run:
    curl ifconfig.me
    # or
    hostname -I
    ```

**Example values:**

- `72.62.161.70`
- `deploy.example.com`
- `192.168.1.100`

---

### 2. DEPLOY_USER

**What it is:** The SSH username you use to log into your server.

**How to find it:**

- **Default usernames by OS:**
    - Ubuntu/Debian: Usually `ubuntu` or `root`
    - CentOS/RHEL: Usually `centos` or `root`
    - Custom: Whatever username you created

- **To find your current user on the server:**

    ```bash
    # SSH into your server and run:
    whoami
    ```

- **Common values:**
    - `root` (if you have root access)
    - `ubuntu` (default on Ubuntu servers)
    - `deploy` (if you created a dedicated deploy user)
    - Your custom username

**Example values:**

- `root`
- `ubuntu`
- `deploy`
- `admin`

---

### 3. DEPLOY_SSH_KEY

**What it is:** Your private SSH key file content that allows GitHub Actions to authenticate with your server.

**How to get/create it:**

#### Option A: If you already have an SSH key pair

1. **Find your existing private key:**

    ```bash
    # On your local machine, check for existing keys:
    ls -la ~/.ssh/

    # Common key files:
    # - id_rsa (private key)
    # - id_ed25519 (private key)
    # - id_ecdsa (private key)
    ```

2. **Copy the private key content:**

    ```bash
    # Display the private key (DO NOT share this publicly!)
    cat ~/.ssh/id_rsa
    # or
    cat ~/.ssh/id_ed25519
    ```

3. **Copy the entire output** (including `-----BEGIN` and `-----END` lines)

#### Option B: Create a new SSH key pair (Recommended)

1. **Generate a new SSH key pair (WITHOUT passphrase - required for GitHub Actions):**

    ```bash
    # On your local machine:
    # IMPORTANT: Use -N "" to create key WITHOUT passphrase
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""

    # Or if ed25519 is not supported:
    ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
    ```

    **⚠️ CRITICAL:** You MUST use `-N ""` to create a key without a passphrase. GitHub Actions cannot handle passphrase-protected keys.

2. **Copy the private key:**

    ```bash
    cat ~/.ssh/github_deploy
    ```

    Copy the entire output (this is your `DEPLOY_SSH_KEY`)

3. **Copy the public key to your server:**

    ```bash
    # Copy public key to server
    ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server-ip

    # Or manually:
    cat ~/.ssh/github_deploy.pub
    # Then on your server, add it to ~/.ssh/authorized_keys
    ```

4. **Test the connection:**
    ```bash
    ssh -i ~/.ssh/github_deploy user@your-server-ip
    ```

**Important Notes:**

- ⚠️ **NEVER** commit the private key to your repository
- ⚠️ The private key should start with `-----BEGIN` and end with `-----END`
- ✅ Use the **private key** (not the `.pub` file) for the secret
- ⚠️ **CRITICAL:** The key must be generated WITHOUT a passphrase (`-N ""`)
- ⚠️ Copy the ENTIRE key including BEGIN/END markers - no extra whitespace

**Example format:**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdz
c2gtcnNhAAAAAwEAAQAAAQEAy...
(many lines of encoded key)
...xyz123
-----END OPENSSH PRIVATE KEY-----
```

---

### 4. DEPLOY_PORT (Optional)

**What it is:** The SSH port number for your server (default is 22).

**How to find it:**

- **Default:** `22` (most common)
- **Custom port:** Check your server's SSH configuration:
    ```bash
    # On your server:
    sudo grep Port /etc/ssh/sshd_config
    ```

**If not specified, defaults to 22.**

---

## 📝 Step-by-Step Setup

### Step 1: Prepare Your Server

1. **Ensure Docker is installed on your server:**

    ```bash
    # SSH into your server
    ssh user@your-server-ip

    # Check if Docker is installed
    docker --version

    # If not installed, install it:
    # Ubuntu/Debian:
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    ```

2. **Create a deploy user (optional but recommended):**
    ```bash
    # On your server:
    sudo adduser deploy
    sudo usermod -aG docker deploy
    sudo usermod -aG sudo deploy
    ```

### Step 2: Generate SSH Key Pair

```bash
# On your local machine:
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# When prompted:
# - Press Enter for default location
# - Enter a passphrase (optional but recommended)
# - Confirm passphrase
```

### Step 3: Add Public Key to Server

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub deploy@your-server-ip

# Or manually:
# 1. Display public key:
cat ~/.ssh/github_deploy.pub

# 2. SSH into server:
ssh deploy@your-server-ip

# 3. Add to authorized_keys:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 4: Test SSH Connection

```bash
# Test connection with the key
ssh -i ~/.ssh/github_deploy deploy@your-server-ip

# If successful, you should be logged in without password
```

### Step 5: Add Secrets to GitHub

1. **Go to your GitHub repository**
2. **Navigate to:** Settings → Secrets and variables → Actions
3. **Click "New repository secret"** for each secret:

    **Secret 1: DEPLOY_HOST**
    - Name: `DEPLOY_HOST`
    - Value: Your server IP (e.g., `72.62.161.70`)

    **Secret 2: DEPLOY_USER**
    - Name: `DEPLOY_USER`
    - Value: Your SSH username (e.g., `deploy` or `ubuntu`)

    **Secret 3: DEPLOY_SSH_KEY**
    - Name: `DEPLOY_SSH_KEY`
    - Value: Your private key content (entire key including BEGIN/END lines)

    **Secret 4: DEPLOY_PORT (Optional)**
    - Name: `DEPLOY_PORT`
    - Value: SSH port (e.g., `22` or `2222`)

### Step 6: Verify Setup

1. **Push a commit to trigger the workflow:**

    ```bash
    git add .
    git commit -m "Test deployment"
    git push origin main
    ```

2. **Check GitHub Actions:**
    - Go to your repository → Actions tab
    - Watch the "Build and Push Docker Image" workflow
    - After it completes, "Deploy to Server" should run automatically

3. **Check your server:**

    ```bash
    # SSH into server
    ssh deploy@your-server-ip

    # Check if container is running
    docker ps

    # Check container logs
    docker logs bkeep-frontend
    ```

---

## 🔒 Security Best Practices

1. **Use a dedicated deploy user** (not root)
2. **Use SSH keys** (not passwords)
3. **Restrict SSH access** to specific IPs if possible
4. **Use a non-standard SSH port** (optional)
5. **Keep your private key secure** - never commit it to git
6. **Rotate keys periodically**

---

## 🐛 Troubleshooting

### Connection Refused

- Check if SSH is running: `sudo systemctl status ssh`
- Verify firewall allows SSH: `sudo ufw status`
- Check SSH port is correct

### Permission Denied

- Verify public key is in `~/.ssh/authorized_keys`
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
- Verify user has Docker permissions: `sudo usermod -aG docker username`
- **Check if key has passphrase** - GitHub Actions cannot use keys with passphrases

### SSH Key Format Error (`ssh: no key found`)

- **Most common cause:** Key has a passphrase
    - Fix: Regenerate key with `-N ""` flag (no passphrase)
- **Second most common:** Extra whitespace in GitHub secret
    - Fix: Copy key again, ensure no leading/trailing spaces
- **Third:** Missing BEGIN/END markers
    - Fix: Copy entire key including `-----BEGIN` and `-----END` lines
- **Fourth:** Wrong key format
    - Fix: Use ed25519 or RSA 4096 format

### Docker Permission Denied

- Add user to docker group: `sudo usermod -aG docker $USER`
- Log out and back in
- Or use: `newgrp docker`

### Image Pull Fails

- Verify GitHub Container Registry access
- Check if image exists: `docker pull ghcr.io/username/repo:latest`
- Ensure GITHUB_TOKEN has package read permissions

---

## 📋 Quick Reference

| Secret           | Example Value   | Where to Find                          |
| ---------------- | --------------- | -------------------------------------- |
| `DEPLOY_HOST`    | `72.62.161.70`  | Server IP from cloud provider          |
| `DEPLOY_USER`    | `deploy`        | `whoami` on server                     |
| `DEPLOY_SSH_KEY` | `-----BEGIN...` | `cat ~/.ssh/github_deploy`             |
| `DEPLOY_PORT`    | `22`            | Default or from `/etc/ssh/sshd_config` |

---

## 💡 Alternative: Manual Deployment

If you don't want to set up automatic deployment, you can manually deploy:

```bash
# 1. Pull the image
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO:latest

# 2. Stop old container
docker stop bkeep-frontend
docker rm bkeep-frontend

# 3. Run new container
docker run -d \
  --name bkeep-frontend \
  -p 80:80 \
  --restart unless-stopped \
  ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

The automatic deployment workflow is optional - the build workflow will still work and push images to the registry.

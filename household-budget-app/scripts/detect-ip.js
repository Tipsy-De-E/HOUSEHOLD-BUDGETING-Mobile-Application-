// scripts/detect-ip.js
const os = require('os');
const fs = require('fs');
const path = require('path');

function getLanIp() {
  const interfaces = os.networkInterfaces();

  // Look through interfaces for real physical LAN/Wi-Fi adapter
  for (const [name, addrs] of Object.entries(interfaces)) {
    // Skip virtual/pseudo adapters (VirtualBox, VMware, Hyper-V vEthernet, WSL, Loopback)
    if (/virtualbox|vethernet|vmware|loopback|pseudo|wsl/i.test(name)) continue;

    for (const iface of addrs) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Skip VirtualBox default host-only subnet (192.168.56.x) and APIPA (169.254.x.x)
        if (iface.address.startsWith('192.168.56.') || iface.address.startsWith('169.254.')) {
          continue;
        }
        return iface.address;
      }
    }
  }

  // Fallback: check all non-internal IPv4 excluding 192.168.56.x and 169.254.x
  for (const [, addrs] of Object.entries(interfaces)) {
    for (const iface of addrs) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('192.168.56.') && !iface.address.startsWith('169.254.')) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

const lanIp = getLanIp();
console.log(`[Expo Metro] Detected active LAN IP: ${lanIp}`);

// Update .env.local automatically
const envLocalPath = path.join(__dirname, '..', '.env.local');
let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
}

const regex = /^REACT_NATIVE_PACKAGER_HOSTNAME=.*$/m;
if (regex.test(envContent)) {
  envContent = envContent.replace(regex, `REACT_NATIVE_PACKAGER_HOSTNAME=${lanIp}`);
} else {
  envContent = `REACT_NATIVE_PACKAGER_HOSTNAME=${lanIp}\n` + envContent;
}

fs.writeFileSync(envLocalPath, envContent.trim() + '\n', 'utf8');
console.log(`[Expo Metro] Synced .env.local -> REACT_NATIVE_PACKAGER_HOSTNAME=${lanIp}`);

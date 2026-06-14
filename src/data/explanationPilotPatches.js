/**
 * Authored short Explanation tiers + Big Takeaway for factory-generated Domain 4 objectives.
 * Merged in getCurated() — does not replace keyPoints / commonMistakes / advanced.
 */

export const EXPLANATION_PILOT_PATCHES = {
  '4.4': {
    tiers: {
      beginner: 'SNMP lets a central manager poll network devices and receive alerts when something changes. The device runs an agent; the manager reads values identified by OIDs in a MIB.',
      intermediate: 'Think manager and agent: the manager asks (Get) or listens for traps when an event occurs. Community strings protect v1/v2c; v3 adds authentication and encryption for production.',
      examReady: 'Know manager vs agent, MIB/OID, polling vs traps, and that v3 is the secure choice — community strings alone are weak.',
    },
    bigTakeaway: 'SNMP is how managers monitor devices — polls for status and traps for events.',
  },
  '4.7': {
    tiers: {
      beginner: 'QoS marks and queues traffic so voice and video survive congestion. Each hop can treat marked packets differently — that per-hop behavior is what you configure on routers and switches.',
      intermediate: 'Classify traffic, mark it (DSCP or CoS), then queue it — voice often gets priority through LLQ. Shaping smooths traffic over time; policing drops or remarks when a rate is exceeded.',
      examReady: 'Recognize classification → marking → queuing → congestion avoidance. Trust boundaries matter: only honor markings where you expect them.',
    },
    bigTakeaway: 'QoS identifies important traffic and gives it better treatment at each hop.',
  },
  '4.8': {
    tiers: {
      beginner: 'SSH encrypts remote CLI sessions so credentials and commands are not sent in clear text like Telnet. It is the standard way to manage Cisco devices securely.',
      intermediate: 'Generate RSA keys, create a local user, and allow SSH on vty lines. Disable Telnet so only encrypted transport is accepted.',
      examReady: 'Expect the setup sequence — domain name, crypto key, username, vty transport ssh — and knowing Telnet is insecure.',
    },
    bigTakeaway: 'Use SSH for remote device management; never rely on cleartext Telnet.',
  },
  '4.9': {
    tiers: {
      beginner: 'TFTP and FTP move files such as IOS images or configs between a device and a server. TFTP is simple and UDP-based; FTP adds more control over the transfer.',
      intermediate: 'Boot a device from flash, then copy to or from a server when upgrading software or backing up configuration. TFTP is lightweight; FTP can be more feature-rich.',
      examReady: 'Know which protocol is used for file copy/backup scenarios and that TFTP is connectionless UDP — not for everyday management like SSH.',
    },
    bigTakeaway: 'TFTP and FTP transfer IOS and config files — TFTP is simple UDP; FTP offers more transfer control.',
  },
  '4.10': {
    tiers: {
      beginner: 'Local management means you configure each device directly — CLI or on-prem tools. Cloud-based management centralizes policy, monitoring, and updates from a controller or dashboard.',
      intermediate: 'Traditional campus ops often mean per-device CLI and SNMP. Controller-based and cloud tools (like DNA Center) push intent, monitor health, and automate at scale.',
      examReady: 'Compare operational models: local CLI vs centralized controller/cloud — agility, visibility, and automation tradeoffs, not vendor marketing slogans.',
    },
    bigTakeaway: 'Local management is per-device; cloud/controller platforms centralize policy and automation.',
  },
}

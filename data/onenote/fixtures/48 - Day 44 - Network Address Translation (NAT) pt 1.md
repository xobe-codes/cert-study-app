# **CCNA Conceptual Lesson — NAT (Network Address Translation) — Part 1**

## **Lesson Purpose**

This lesson introduces **NAT (Network Address Translation)** for the CCNA exam and real-world networking.

NAT is part of Exam Topic 4.1 — Configure and verify inside source NAT using static and pools.

## **Why NAT Exists (IPv4 Address Exhaustion)**

IPv4 does not provide enough globally unique addresses for all devices. Private IPv4 addresses and NAT extended IPv4's lifespan until IPv6 adoption.

## **Private IPv4 Addresses (RFC 1918)**

Private IPv4 addresses are not globally unique and cannot be routed on the Internet.

Key rules:

- Safe to use internally
- Can be reused across organizations
- Dropped by ISPs if sent directly to the Internet

## **NAT Terminology**

- **Inside local** — private address on the LAN
- **Inside global** — public address seen by the Internet
- **Outside global** — public address of the remote host

**Key Rule:** Static NAT maps one inside local to one inside global permanently.

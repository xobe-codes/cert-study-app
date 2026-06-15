# **CCNA Conceptual Lesson — VLANs (Virtual LANs)**

## **Lesson Purpose**

This lesson introduces **VLANs (Virtual Local Area Networks)** for the CCNA and real-world networks. VLANs allow you to logically separate devices at Layer 2 on the same switch.

By the end of this lesson, you should understand:

- What a broadcast domain is
- Why VLANs are necessary
- How VLANs improve performance and security

## **What Is a LAN?**

A **LAN (Local Area Network)** is best defined as a single broadcast domain. A broadcast frame uses destination MAC FFFF.FFFF.FFFF — every device in that domain receives it.

## **Broadcast Domains and Network Devices**

- **Switches** flood broadcasts and extend broadcast domains
- **Routers** do not forward broadcasts — each router interface is a broadcast domain boundary

**Exam-Critical:** Layer 3 subnets alone do not break broadcast domains without a router or L3 switch SVI.

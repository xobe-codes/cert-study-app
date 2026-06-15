# **CCNA Conceptual Lesson — OSPF Fundamentals (Single‑Area OSPFv2)**

## **Lesson Purpose**

This lesson introduces **OSPF (Open Shortest Path First)**, the only dynamic routing protocol explicitly listed in the CCNA exam topics.

By the end of this lesson, you should understand:

- How OSPF works at a high level
- What LSAs and the LSDB are
- Core OSPF terminology (ABR, backbone)
- OSPF router ID behavior

Exam Topic 3.4

## **What OSPF Is**

**OSPF** is a link-state Interior Gateway Protocol for IPv4. OSPF uses the Shortest Path First (SPF) algorithm to calculate the best paths through the network.

Key contrast:

- Distance vector protocols use routing by rumor
- OSPF builds a complete topology map

## **Link-State Operation (High Level)**

OSPF routers form neighbor adjacencies, exchange Link State Advertisements (LSAs), and build an identical Link State Database (LSDB) per area. Every router in the same OSPF area has the same LSDB and its own independently calculated routing table.

**Core Distinction:** Neighbor adjacency must match area, hello/dead timers, and subnet before LSDB sync begins.

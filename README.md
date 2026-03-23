# 💬 Tars Chat — Real-Time Messaging App

A modern, real-time chat application built with **Next.js 16**, **Convex**, and **Clerk**. Supports 1-on-1 conversations, group chats, emoji reactions, typing indicators, and online presence tracking.

---

## ✨ Features

- **Real-Time Messaging** — Messages appear instantly using Convex's reactive queries
- **1-on-1 & Group Conversations** — Private chats or named group conversations with multiple participants
- **Emoji Reactions** — React to messages with 👍 ❤️ 😂 😮 😢 (toggle on/off)
- **Message Deletion** — Delete your own messages (soft-delete with "message was deleted" placeholder)
- **Typing Indicators** — See when others are typing in real time
- **Online/Offline Presence** — Live status indicators with "last seen" timestamps
- **Unread Message Counts** — Badge counts for unread messages per conversation
- **User Search** — Find and start conversations with other users by name or email
- **Authentication** — Secure sign-in/sign-up powered by Clerk (OAuth + email)
- **Responsive UI** — Sidebar + chat layout adapts to desktop and mobile screens

---

## 🛠️ Tech Stack

| Layer        | Technology                                                    |
|-------------|--------------------------------------------------------------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router)              |
| **Backend**   | [Convex](https://convex.dev) (serverless database + functions) |
| **Auth**      | [Clerk](https://clerk.com) (authentication & user management) |
| **Styling**   | [Tailwind CSS v4](https://tailwindcss.com)                  |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| **Icons**     | [Lucide React](https://lucide.dev)                          |
| **Language**  | TypeScript                                                   |

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Sign-in & sign-up pages (Clerk)
│   ├── (root)/              # Main app layout & home page
│   │   └── conversation/    # Individual conversation view
│   ├── globals.css          # Global styles & Tailwind config
│   └── layout.tsx           # Root layout with providers
├── components/
│   ├── chat/                # Chat UI components
│   │   ├── ChatHeader.tsx       # Conversation header with user info
│   │   ├── MessageBubble.tsx    # Message bubble with reactions & actions
│   │   ├── MessageInput.tsx     # Message composer input
│   │   ├── MessageList.tsx      # Scrollable message list
│   │   └── TypingIndicator.tsx  # "User is typing..." indicator
│   ├── sidebar/             # Sidebar components
│   │   ├── Sidebar.tsx          # Main sidebar with conversation list
│   │   ├── ConversationItem.tsx # Individual conversation preview
│   │   ├── CreateGroupDialog.tsx# Group creation modal
│   │   └── UserSearch.tsx       # User search & new chat
│   ├── providers/           # Context providers (Convex + Clerk)
│   └── ui/                  # shadcn/ui primitives
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema
│   ├── users.ts             # User CRUD & presence mutations
│   ├── conversations.ts     # Conversation queries & mutations
│   ├── messages.ts          # Message send/delete/react
│   └── typing.ts            # Typing indicator logic
├── hooks/                   # Custom React hooks
└── lib/                     # Utility functions
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- A [Convex](https://convex.dev) account (free tier available)
- A [Clerk](https://clerk.com) account (free tier available)

### 1. Clone the Repository

```bash
git clone https://github.com/Dexter-2005/TarsChat.git
cd TarsChat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following keys:

```env
# Convex
CONVEX_DEPLOYMENT=<your-convex-deployment>
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
```

### 4. Set Up Convex

```bash
npx convex dev
```

This will push your schema and functions to your Convex deployment.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting.

---

## 📊 Database Schema

| Table                       | Purpose                                          |
|----------------------------|--------------------------------------------------|
| `users`                    | User profiles with Clerk ID, name, email, avatar, online status |
| `conversations`            | 1-on-1 or group chats with participant lists      |
| `messages`                 | Chat messages with sender, content, reactions, soft-delete |
| `typingIndicators`         | Tracks who is currently typing in which conversation |
| `conversationParticipants` | Per-user read timestamps for unread count tracking |

---

## 📝 License

This project was built as an internship task.

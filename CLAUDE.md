# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

**TARS** is an AI business assistant workspace for building automations and managing business processes. It integrates with n8n (workflow automation platform) via the n8n MCP Server and organizes multiple sub-projects under one repo.

The primary language is Russian for user-facing docs; code and technical docs are in English.

## Repository Structure

```
Tars/
├── .claude/                # Claude Code config, n8n connection settings, permissions
├── .env                    # Environment variables (secret - never commit)
├── .env.template           # Template for env vars
├── Projects/               # Sub-projects
│   ├── n8n-mcp/            # n8n MCP Server (TypeScript, main codebase)
│   └── Cigar-Shop-AI-Agent/ # AI agent project for cigar shop (n8n workflows + prompts)
├── docs/                   # Documentation (setup guides, examples, analysis)
├── templates/              # Workflow templates
├── prompts/                # AI prompts
└── archive/                # Archived materials
```

## Sub-Projects

### n8n-mcp (`Projects/n8n-mcp/`)
The main codebase. A TypeScript MCP server providing AI assistants access to n8n node information. Has its own `CLAUDE.md` with detailed architecture, commands, and development guidelines. Refer to that file when working in that directory.

### Cigar-Shop-AI-Agent (`Projects/Cigar-Shop-AI-Agent/`)
An AI-powered customer service agent for a cigar shop, built with n8n workflows and ElevenLabs voice integration.

## n8n Integration

- **Instance:** Connected via MCP server (see `.claude/n8n-connection-status.md`)
- **Config:** `.claude/n8n-config.json` (gitignored)
- **API credentials:** In `.env` (gitignored)

### Permission Model
Defined in `.claude/permissions.json`:
- **Allowed:** Search and read operations (`search*`, `get*`)
- **Ask first:** Create operations (`create*`)
- **Denied:** Delete operations (`delete*`)

## Key Guidelines

- Do what is asked; nothing more, nothing less
- Prefer editing existing files over creating new ones
- Never proactively create documentation files unless explicitly requested
- Do not use dramatic or hyperbolic language in comments and documentation
- When tasks can be divided into subtasks, use sub-agents in parallel
- Sub-agents must not spawn further sub-agents
- Sub-agents must not commit or push; only the main agent handles git operations
- When reviewing GitHub issues, use `gh` CLI to get issues and comments
- When making changes to the MCP server, ask the user to reload it before testing
- Never commit `.env`, API keys, or `*-config.json` files

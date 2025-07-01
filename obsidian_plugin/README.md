# Grimbane - Obsidian Plugin

🔒 **IMPORTANT PRIVACY NOTICE**
This plugin connects to external servers and transmits your note content. Please read the security information below.

## Overview

This plugin integrates Obsidian with the Grimbane platform, allowing you to selectively publish notes using `[PUBLIC]` markers.

## 🛡️ Security & Privacy

### Data Transmission
- **External Server Connection**: This plugin sends data to a campaign management server
- **Content Sharing**: Notes marked with `[PUBLIC]` blocks are transmitted to external servers
- **Image Upload**: Images in public sections are uploaded to external storage
- **API Token**: Uses secure API tokens instead of passwords

### What Data is Sent
- ✅ Only content within `[PUBLIC]` markers
- ✅ Images referenced in public sections
- ✅ Note titles and metadata
- ❌ Private content outside `[PUBLIC]` blocks is NEVER sent

### Security Features
- 🔐 API token authentication (no password storage)
- 🔐 Encrypted token storage on device
- 🔐 HTTPS connections required
- 🔐 Session-based authentication

### Before Using This Plugin
1. **Review your server setup** - Ensure your campaign server is secure
2. **Check public markers** - Only content in `[PUBLIC]` blocks will be shared
3. **Understand data flow** - Your notes will be stored on the campaign server
4. **Get API token** - Obtain a secure API token from your campaign manager

## Setup

1. Install the plugin
2. Go to Settings → Grimbane
3. **Generate API Token**:
   - Log into your campaign manager web interface
   - Go to Settings → API Tokens
   - Create a new token with appropriate permissions
4. Enter your API token (NOT your password)
5. Test connection
6. Select your campaign room

## Usage

### Publishing Notes
Mark content for publication using `[PUBLIC]` blocks:

```markdown
This content stays private in Obsidian

[PUBLIC]
This content will be shared with your campaign
- Including images: ![map](dungeon-map.png)
- And any other markdown
[!PUBLIC]

This content is private again
```

### Commands
- **Publish note to campaign** - Publishes current note
- **Preview public content** - Shows what will be published
- **Insert PUBLIC block** - Adds public markers
- **Wrap selection in PUBLIC block** - Wraps selected text

## Data Storage

- **Local**: API tokens are encrypted before storage
- **Remote**: Public content is stored on your campaign server
- **Images**: Uploaded to campaign server storage

## Troubleshooting

### Connection Issues
- Verify API token is correct
- Check server URL format: `https://your-server.com`
- Ensure server is running and accessible

### Security Concerns
- Use HTTPS-only servers in production
- Regularly rotate API tokens
- Review published content periodically
- Consider self-hosting for maximum privacy

## Development

Built with modern web standards:
- TypeScript for type safety
- ESBuild for fast compilation
- Obsidian Plugin API

## Support

For issues:
1. Check server logs
2. Verify API token permissions
3. Test connection in settings
4. Review public content markers

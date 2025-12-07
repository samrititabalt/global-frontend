# Ringtone Setup Guide

## Adding a Ringtone File

To add a custom ringtone for voice calls:

1. **Download or create a ringtone file**
   - Format: MP3 (recommended) or WAV
   - Duration: 2-3 seconds (will loop)
   - Sample rate: 44.1kHz or 48kHz
   - Bitrate: 128kbps or higher

2. **Place the file**
   - Location: `frontend/public/ringtone.mp3`
   - Name must be exactly: `ringtone.mp3`

3. **Recommended Sources**
   - WhatsApp ringtones (royalty-free versions)
   - Free ringtone websites
   - Create your own using Audacity or similar software

## Fallback

If `ringtone.mp3` is not found, the app will automatically generate a simple beep tone using Web Audio API. This ensures ringtones always work, even without a file.

## Testing

1. Start a voice call
2. You should hear the ringtone when:
   - Making an outgoing call (while ringing)
   - Receiving an incoming call
3. The ringtone stops when:
   - Call is accepted
   - Call is rejected
   - Call ends

## Customization

To use a different ringtone:
1. Replace `frontend/public/ringtone.mp3` with your file
2. Ensure the filename is exactly `ringtone.mp3`
3. Clear browser cache if needed

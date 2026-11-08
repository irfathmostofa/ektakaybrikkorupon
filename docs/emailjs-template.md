# EmailJS template

Use one EmailJS template for contact replies, donation receipts, membership and career mail, and admin campaign sends.

Configure the service ID, template ID, public key, and private key in Admin → Settings. Campaign sends use the private key on the server.

## Dashboard fields

In EmailJS → Email Templates → your template → Settings:

| Field | Value |
| --- | --- |
| To Email | `{{to_email}}` |
| To Name | `{{to_name}}` |
| From Name | `{{from_name}}` |
| Reply To | `{{reply_to}}` |
| Subject | `{{subject}}` |

Do not hardcode a recipient. The app always sends `to_email`.

## Template variables

The app sends these params:

| Variable | Used for |
| --- | --- |
| `to_email` | Recipient address |
| `to_name` | Recipient name |
| `subject` | Email subject |
| `title` | Heading (transactional mail) |
| `message` | Plain-text body (transactional mail) |
| `message_html` | HTML body (admin campaigns) |
| `reply_to` | Reply-to address |
| `from_name` | Foundation name |
| `unsubscribe_link` | Campaign unsubscribe URL |

## Subject

```text
{{subject}}
```

## HTML template

Paste this into the EmailJS template content editor:

```html
<!DOCTYPE html>
<html lang="bn">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{subject}}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f6f1;font-family:Arial,Helvetica,sans-serif;color:#1f3d27;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6f1;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d7e3cf;">
            <tr>
              <td style="background:#1f3d27;color:#c5e1a5;padding:20px 28px;font-size:18px;font-weight:700;">
                {{from_name}}
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#5f7a58;">
                  {{from_name}}
                </p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#1f3d27;">
                  {{title}}
                </h1>
                <div style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#33473a;white-space:pre-wrap;">
                  {{message}}
                </div>
                <div style="margin:0;font-size:16px;line-height:1.7;color:#33473a;">
                  {{{message_html}}}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7f68;">
                  {{unsubscribe_link}}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

`{{{message_html}}}` must stay triple-braced so campaign HTML is not escaped.

## Optional unsubscribe row

If you only want the unsubscribe link on campaigns, replace the footer cell with:

```html
{{#unsubscribe_link}}
<p style="margin:0;font-size:13px;line-height:1.6;color:#6b7f68;">
  <a href="{{unsubscribe_link}}" style="color:#2f5d3a;">Unsubscribe</a>
</p>
{{/unsubscribe_link}}
```

## Test values

Use these in EmailJS → Test:

```json
{
  "to_email": "you@example.com",
  "to_name": "Test User",
  "subject": "Test from 1 Taka Tree Plantation",
  "title": "Thank you",
  "message": "This is a transactional test message.",
  "message_html": "<p>This is a <strong>campaign</strong> test.</p>",
  "reply_to": "you@example.com",
  "from_name": "1 Taka Tree Plantation",
  "unsubscribe_link": "https://example.com/unsubscribe"
}
```

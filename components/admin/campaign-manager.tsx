"use client";

import { useMemo, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  campaignUnsubscribeUrl,
  deleteCampaignAction,
  listCampaignRecipients,
  recordCampaignSendAction,
  saveCampaignAction,
  type CampaignRecipient,
} from "@/actions/campaigns";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { asFormAction } from "@/lib/admin/form-action";
import { CAMPAIGN_AUDIENCES } from "@/lib/constants";
import type {
  CampaignAudience,
  EmailCampaign,
} from "@/lib/types/database";

const EMAILJS_MONTHLY_LIMIT = 200;

function CampaignForm({
  campaign,
}: {
  campaign?: EmailCampaign;
}) {
  return (
    <form action={asFormAction(saveCampaignAction)} className="grid gap-3">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}
      <input type="hidden" name="status" value="draft" />
      <div className="space-y-2">
        <Label htmlFor="name">Campaign name</Label>
        <Input id="name" name="name" defaultValue={campaign?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" defaultValue={campaign?.subject} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audience">Audience</Label>
        <select
          id="audience"
          name="audience"
          defaultValue={campaign?.audience ?? "subscribers"}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {CAMPAIGN_AUDIENCES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <RichTextEditor name="body" label="Message" defaultValue={campaign?.body} />
      <SubmitButton>Save draft</SubmitButton>
    </form>
  );
}

export function CampaignManager({
  campaigns,
  emailConfig,
  senderEmail,
  senderName,
}: {
  campaigns: EmailCampaign[];
  emailConfig: { serviceId: string; templateId: string; publicKey: string } | null;
  senderEmail: string;
  senderName: string;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EmailCampaign | null>(null);
  const [sending, setSending] = useState<EmailCampaign | null>(null);
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failedEmails, setFailedEmails] = useState<CampaignRecipient[]>([]);

  const history = useMemo(
    () => campaigns.filter((item) => item.status !== "draft"),
    [campaigns],
  );

  async function openSend(campaign: EmailCampaign) {
    setMessage(null);
    setSending(campaign);
    const list = await listCampaignRecipients(campaign.audience as CampaignAudience);
    setRecipients(list);
    setProgress({ sent: 0, failed: 0, total: list.length });
    setFailedEmails([]);
  }

  async function sendTo(list: CampaignRecipient[], campaign: EmailCampaign) {
    if (!emailConfig) {
      setMessage("EmailJS is not configured.");
      return;
    }
    setBusy(true);
    let sent = 0;
    let failed = 0;
    const failedList: CampaignRecipient[] = [];
    setProgress({ sent: 0, failed: 0, total: list.length });
    for (const recipient of list) {
      try {
        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          {
            to_email: recipient.email,
            to_name: recipient.name,
            subject: campaign.subject,
            message_html: campaign.body,
            unsubscribe_link: campaignUnsubscribeUrl(recipient.email),
          },
          { publicKey: emailConfig.publicKey },
        );
        sent += 1;
      } catch {
        failed += 1;
        failedList.push(recipient);
      }
      setProgress({ sent, failed, total: list.length });
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    setFailedEmails(failedList);
    const formData = new FormData();
    formData.set("id", campaign.id);
    formData.set("sent_count", String(sent));
    formData.set("failed_count", String(failed));
    formData.set("recipient_count", String(list.length));
    await recordCampaignSendAction(formData);
    setBusy(false);
    setMessage(`Sent ${sent} of ${list.length}. Failed ${failed}.`);
  }

  async function sendTest(campaign: EmailCampaign) {
    if (!emailConfig || !senderEmail) {
      setMessage("Sign in email is missing.");
      return;
    }
    setBusy(true);
    try {
      await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        {
          to_email: senderEmail,
          to_name: senderName || senderEmail,
          subject: `[TEST] ${campaign.subject}`,
          message_html: campaign.body,
          unsubscribe_link: campaignUnsubscribeUrl(senderEmail),
        },
        { publicKey: emailConfig.publicKey },
      );
      setMessage(`Test email sent to ${senderEmail}.`);
    } catch {
      setMessage("Test email failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreating(true)}>
          New campaign
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>{campaign.name}</TableCell>
              <TableCell>{campaign.audience}</TableCell>
              <TableCell>
                <Badge variant="secondary">{campaign.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell>
                {campaign.sent_count}/{campaign.recipient_count || 0}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(campaign)}>
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void openSend(campaign)}>
                    Send
                  </Button>
                  <ConfirmDelete
                    onConfirm={async () => {
                      const formData = new FormData();
                      formData.set("id", campaign.id);
                      await deleteCampaignAction(formData);
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {history.length ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">History</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sent_count}</TableCell>
                  <TableCell>{item.failed_count}</TableCell>
                  <TableCell>
                    {item.sent_at ? new Date(item.sent_at).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <FormDialog
        title={editing ? "Edit campaign" : "New campaign"}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <CampaignForm campaign={editing ?? undefined} />
      </FormDialog>

      <FormDialog
        title="Send campaign"
        open={Boolean(sending)}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setSending(null);
          }
        }}
      >
        {sending ? (
          <div className="space-y-4">
            <p className="text-sm">
              Audience: {sending.audience}. Recipients: {recipients.length}.
            </p>
            {recipients.length > EMAILJS_MONTHLY_LIMIT ? (
              <p className="text-sm text-destructive">
                EmailJS free plans usually allow {EMAILJS_MONTHLY_LIMIT} emails per month.
                This send exceeds that limit.
              </p>
            ) : recipients.length > 50 ? (
              <p className="text-sm text-muted-foreground">
                Large send. EmailJS typically limits {EMAILJS_MONTHLY_LIMIT} emails per month.
              </p>
            ) : null}
            {progress.total > 0 && busy ? (
              <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.round(((progress.sent + progress.failed) / progress.total) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sent {progress.sent} of {progress.total}. Failed {progress.failed}.
                </p>
              </div>
            ) : null}
            {message ? <p className="text-sm">{message}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void sendTest(sending)}
              >
                Send test to me
              </Button>
              <Button
                type="button"
                disabled={busy || !recipients.length}
                onClick={() => void sendTo(recipients, sending)}
              >
                Send now
              </Button>
              {failedEmails.length ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void sendTo(failedEmails, sending)}
                >
                  Retry failed
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </FormDialog>
    </div>
  );
}

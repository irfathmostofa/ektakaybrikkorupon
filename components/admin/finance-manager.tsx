"use client";

import { useMemo, useState } from "react";
import {
  deleteFinanceCategoryAction,
  deleteFinanceEntryAction,
  saveFinanceCategoryAction,
  saveFinanceEntryAction,
} from "@/actions/finance";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormDialog } from "@/components/admin/form-dialog";
import { ImageField } from "@/components/admin/image-field";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { asFormAction } from "@/lib/admin/form-action";
import type { FinanceCategory, FinanceEntry, FinanceKind } from "@/lib/types/database";

function EntryForm({
  kind,
  entry,
  categories,
}: {
  kind: FinanceKind;
  entry?: FinanceEntry;
  categories: FinanceCategory[];
}) {
  const options = categories.filter((item) => item.kind === kind);
  return (
    <form action={asFormAction(saveFinanceEntryAction)} className="grid gap-3">
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
      <input type="hidden" name="kind" value={kind} />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="entry_date">Date</Label>
          <Input
            id="entry_date"
            name="entry_date"
            type="date"
            defaultValue={entry?.entry_date ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={entry?.amount ?? 0}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">{kind === "collection" ? "Title / source" : "Title"}</Label>
        <Input id="title" name="title" defaultValue={entry?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title_en">Title (English)</Label>
        <Input id="title_en" name="title_en" defaultValue={entry?.title_en ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category_id">{kind === "collection" ? "Source category" : "Category"}</Label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={entry?.category_id ?? ""}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">None</option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="source_or_payee">
          {kind === "collection" ? "Source" : "Payee"}
        </Label>
        <Input
          id="source_or_payee"
          name="source_or_payee"
          defaultValue={entry?.source_or_payee ?? ""}
        />
      </div>
      <RichTextEditor
        name="description"
        label="Note"
        defaultValue={entry?.description}
      />
      <ImageField
        name="receipt_url"
        label="Receipt image"
        defaultValue={entry?.receipt_url}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked={entry?.is_published} />
        Published
      </label>
      <SubmitButton>{entry ? "Update entry" : "Add entry"}</SubmitButton>
    </form>
  );
}

function CategoryForm({
  kind,
  category,
}: {
  kind: FinanceKind;
  category?: FinanceCategory;
}) {
  return (
    <form action={asFormAction(saveFinanceCategoryAction)} className="grid gap-3">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <input type="hidden" name="kind" value={kind} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name_en">Name (English)</Label>
        <Input id="name_en" name="name_en" defaultValue={category?.name_en ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} />
        Active
      </label>
      <SubmitButton>{category ? "Save" : "Add category"}</SubmitButton>
    </form>
  );
}

export function FinanceManager({
  entries,
  categories,
}: {
  entries: FinanceEntry[];
  categories: FinanceCategory[];
}) {
  const [kind, setKind] = useState<FinanceKind>("collection");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editing, setEditing] = useState<FinanceEntry | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (entry.kind !== kind) {
        return false;
      }
      if (categoryId && entry.category_id !== categoryId) {
        return false;
      }
      if (from && entry.entry_date < from) {
        return false;
      }
      if (to && entry.entry_date > to) {
        return false;
      }
      return true;
    });
  }, [entries, kind, categoryId, from, to]);

  const collectionTotal = entries
    .filter((entry) => entry.kind === "collection")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const expenseTotal = entries
    .filter((entry) => entry.kind === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const visibleTotal = filtered.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const kindCategories = categories.filter((item) => item.kind === kind);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Collections</p>
          <p className="mt-1 text-xl font-semibold">{collectionTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="mt-1 text-xl font-semibold">{expenseTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="mt-1 text-xl font-semibold">
            {(collectionTotal - expenseTotal).toLocaleString()}
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="collection"
        onValueChange={(value) => {
          setKind(value as FinanceKind);
          setCategoryId("");
        }}
      >
        <TabsList>
          <TabsTrigger value="collection">Collections</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {(["collection", "expense"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label>From</Label>
                <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>To</Label>
                <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">All</option>
                  {kindCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                Filtered total: {visibleTotal.toLocaleString()}
              </p>
              <div className="ml-auto">
                <Button type="button" onClick={() => setCreating(true)}>
                  Add new
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.entry_date}</TableCell>
                    <TableCell>{entry.title}</TableCell>
                    <TableCell>{entry.category?.name ?? "—"}</TableCell>
                    <TableCell>{Number(entry.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(entry)}
                        >
                          Edit
                        </Button>
                        <ConfirmDelete
                          onConfirm={async () => {
                            const formData = new FormData();
                            formData.set("id", entry.id);
                            await deleteFinanceEntryAction(formData);
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}

        <TabsContent value="categories" className="space-y-4">
          <FormDialog triggerLabel="Add new" title="Add category">
            <CategoryForm kind={kind} />
          </FormDialog>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.kind}</Badge>
                  </TableCell>
                  <TableCell>{category.is_active ? "Active" : "Hidden"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <FormDialog triggerLabel="Edit" title="Edit category">
                        <CategoryForm kind={category.kind} category={category} />
                      </FormDialog>
                      <ConfirmDelete
                        onConfirm={async () => {
                          const formData = new FormData();
                          formData.set("id", category.id);
                          await deleteFinanceCategoryAction(formData);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <FormDialog
        title={editing ? "Edit entry" : `Add ${kind}`}
        open={creating || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        size="lg"
      >
        <EntryForm kind={editing?.kind ?? kind} entry={editing ?? undefined} categories={categories} />
      </FormDialog>
    </div>
  );
}

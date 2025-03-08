
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MultiSelect } from '@/components/ui/multi-select';
import { useGroups } from '@/hooks/useGroups';
import { Group } from '@/types/group';
import { Dashboard } from '@/types/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required'),
  description: z.string().optional(),
  embedType: z.enum(['url', 'code']),
  url: z.string().optional(),
  embedCode: z.string().optional(),
  visibility: z.string().min(1, 'Visibility is required'),
  groups: z.array(z.string()).optional(),
}).refine(data => {
  // Ensure either URL or embed code is provided based on embedType
  if (data.embedType === 'url') {
    return !!data.url;
  } else {
    return !!data.embedCode;
  }
}, {
  message: "Either URL or embed code is required based on your selection",
  path: ['url', 'embedCode'],
});

type FormData = z.infer<typeof formSchema>;

interface DashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  dashboard?: Dashboard;
  mode: 'create' | 'edit';
}

export function DashboardDialog({
  open,
  onOpenChange,
  onSubmit,
  dashboard,
  mode = 'create',
}: DashboardDialogProps) {
  const { groups, loading: loadingGroups } = useGroups();
  const [embedType, setEmbedType] = useState<'url' | 'code'>('url');
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      embedType: 'url',
      url: '',
      embedCode: '',
      visibility: 'private',
      groups: [],
    },
  });

  // Handle embed type change to conditionally show URL or embed code form field
  const onEmbedTypeChange = (value: 'url' | 'code') => {
    setEmbedType(value);
    form.setValue('embedType', value);
  };

  useEffect(() => {
    if (dashboard && mode === 'edit') {
      const hasEmbedCode = !!dashboard.embed_code;
      setEmbedType(hasEmbedCode ? 'code' : 'url');
      
      form.reset({
        name: dashboard.name,
        description: dashboard.description || '',
        embedType: hasEmbedCode ? 'code' : 'url',
        url: dashboard.url || dashboard.tableau_url || '',
        embedCode: dashboard.embed_code || '',
        visibility: dashboard.visibility || 'private',
        groups: dashboard.groups || [],
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        description: '',
        embedType: 'url',
        url: '',
        embedCode: '',
        visibility: 'private',
        groups: [],
      });
      setEmbedType('url');
    }
  }, [dashboard, mode, open, form]);

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Dashboard' : 'Edit Dashboard'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new analytics dashboard to your collection.'
              : 'Update the details of your dashboard.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dashboard Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sales Overview" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="General overview of sales performance"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of what this dashboard displays
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embedType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed Method</FormLabel>
                  <Tabs 
                    value={field.value} 
                    onValueChange={(value) => onEmbedTypeChange(value as 'url' | 'code')}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="url">Dashboard URL</TabsTrigger>
                      <TabsTrigger value="code">Embed Code</TabsTrigger>
                    </TabsList>
                    <FormMessage />
                  </Tabs>
                  <FormDescription>
                    Choose how to embed your dashboard
                  </FormDescription>
                </FormItem>
              )}
            />

            {embedType === 'url' ? (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dashboard URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://public.tableau.com/views/YourDashboard" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The URL to your embedded dashboard (Tableau, Looker, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="embedCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Embed Code</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="<div class='tableauPlaceholder'..."
                        className="min-h-[150px] font-mono text-xs"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Paste the HTML embed code from your dashboard provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">Private (Groups Only)</SelectItem>
                      <SelectItem value="public">Public (All Users)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Who can view this dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Groups</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={groups.map((group: Group) => ({
                        label: group.name,
                        value: group.id,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select groups..."
                      disabled={loadingGroups}
                      loading={loadingGroups}
                    />
                  </FormControl>
                  <FormDescription>
                    Groups that can access this dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Create Dashboard' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

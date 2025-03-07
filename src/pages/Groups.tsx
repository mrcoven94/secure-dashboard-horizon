
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Folders } from 'lucide-react';

export default function Groups() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
          <p className="text-muted-foreground">
            Organize users into functional groups for better collaboration
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-border/40 bg-card/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Groups</CardTitle>
                <CardDescription>
                  This page is under development
                </CardDescription>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Folders className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p>Group management functionality will be implemented soon.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

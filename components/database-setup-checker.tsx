"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Database, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function DatabaseSetupChecker() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isChecking, setIsChecking] = useState(false)
  const [setupStatus, setSetupStatus] = useState<'unknown' | 'checking' | 'ready' | 'needs-setup'>('unknown')
  const [showSetupInstructions, setShowSetupInstructions] = useState(false)

  const checkDatabaseSetup = async () => {
    if (!user) return
    
    setIsChecking(true)
    setSetupStatus('checking')
    
    try {
      // Try to query the todos table
      const { data, error } = await supabase
        .from('todos')
        .select('count')
        .eq('user_id', user.id)
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('relation "todos" does not exist')) {
          setSetupStatus('needs-setup')
          setShowSetupInstructions(true)
        } else {
          console.error('Database check error:', error)
          setSetupStatus('needs-setup')
        }
      } else {
        setSetupStatus('ready')
      }
    } catch (error) {
      console.error('Database check failed:', error)
      setSetupStatus('needs-setup')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (user && setupStatus === 'unknown') {
      checkDatabaseSetup()
    }
  }, [user, setupStatus])

  const copySchemaToClipboard = async () => {
    const schema = `-- Create the todos table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  explanation TEXT, -- Store AI-generated or user-provided explanations
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_created_at ON todos(created_at);
CREATE INDEX idx_todos_due_date ON todos(due_date);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();`

    try {
      await navigator.clipboard.writeText(schema)
      toast({
        title: "Schema copied!",
        description: "Database schema has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the schema manually from supabase-schema.sql",
        variant: "destructive",
      })
    }
  }

  if (!user || setupStatus === 'unknown' || setupStatus === 'ready') {
    return null
  }

  return (
    <AnimatePresence>
      {setupStatus === 'needs-setup' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-4 p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                Database Setup Required
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                To enable cloud sync, you need to set up the database schema in your Supabase project.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={copySchemaToClipboard}
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-amber-100/50 dark:bg-amber-900/30 border-amber-300/50 dark:border-amber-700/50"
                >
                  <Copy className="w-4 h-4" />
                  Copy Schema
                </Button>
                
                <Button
                  onClick={() => window.open('https://supabase.com/dashboard/project', '_blank')}
                  size="sm"
                  variant="outline"
                  className="gap-2 bg-amber-100/50 dark:bg-amber-900/30 border-amber-300/50 dark:border-amber-700/50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Supabase
                </Button>
                
                <Button
                  onClick={checkDatabaseSetup}
                  size="sm"
                  disabled={isChecking}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Database className="w-4 h-4" />
                  {isChecking ? 'Checking...' : 'Check Again'}
                </Button>
              </div>
              
              <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                <strong>Quick steps:</strong> 1) Copy schema → 2) Open Supabase → 3) Go to SQL Editor → 4) Paste & run → 5) Check again
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

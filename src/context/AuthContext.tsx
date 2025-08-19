@@ .. @@
 import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
+import { supabase } from '../lib/supabase';
+import type { User as SupabaseUser } from '@supabase/supabase-js';

 interface User {
   email: string;
   id: string;
 }

@@ .. @@
 export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
-    // Check if user is already logged in
-    const storedUser = localStorage.getItem('smartpix_user');
-    if (storedUser) {
-      try {
-        setUser(JSON.parse(storedUser));
-      } catch (error) {
-        console.error('Error parsing stored user data:', error);
-        localStorage.removeItem('smartpix_user');
+    // Get initial session
+    supabase.auth.getSession().then(({ data: { session } }) => {
+      if (session?.user) {
+        setUser({
+          id: session.user.id,
+          email: session.user.email || '',
+        });
       }
-    }
-    setLoading(false);
+      setLoading(false);
+    });
+
+    // Listen for auth changes
+    const {
+      data: { subscription },
+    } = supabase.auth.onAuthStateChange((_event, session) => {
+      if (session?.user) {
+        setUser({
+          id: session.user.id,
+          email: session.user.email || '',
+        });
+      } else {
+        setUser(null);
+      }
+      setLoading(false);
+    });
+
+    return () => subscription.unsubscribe();
   }, []);

   const login = async (email: string, password: string): Promise<void> => {
-    // This is a mock implementation
-    // In a real app, you would call your authentication API
-    return new Promise((resolve, reject) => {
-      setTimeout(() => {
-        // Simulate validation
-        if (!email || !password) {
-          reject(new Error('Email and password are required'));
-          return;
-        }
-        
-        if (password.length < 6) {
-          reject(new Error('Password must be at least 6 characters'));
-          return;
-        }
-        
-        // Create mock user
-        const newUser = {
-          email,
-          id: Math.random().toString(36).substring(2, 15),
-        };
-        
-        setUser(newUser);
-        localStorage.setItem('smartpix_user', JSON.stringify(newUser));
-        resolve();
-      }, 1000);
-    });
+    const { error } = await supabase.auth.signInWithPassword({
+      email,
+      password,
+    });
+
+    if (error) {
+      throw error;
+    }
   };

   const signup = async (email: string, password: string): Promise<void> => {
-    // This is a mock implementation
-    // In a real app, you would call your authentication API
-    return new Promise((resolve, reject) => {
-      setTimeout(() => {
-        // Simulate validation
-        if (!email || !password) {
-          reject(new Error('Email and password are required'));
-          return;
-        }
-        
-        if (password.length < 6) {
-          reject(new Error('Password must be at least 6 characters'));
-          return;
-        }
-        
-        // Create mock user
-        const newUser = {
-          email,
-          id: Math.random().toString(36).substring(2, 15),
-        };
-        
-        setUser(newUser);
-        localStorage.setItem('smartpix_user', JSON.stringify(newUser));
-        resolve();
-      }, 1000);
-    });
+    const { error } = await supabase.auth.signUp({
+      email,
+      password,
+    });
+
+    if (error) {
+      throw error;
+    }
   };

-  const logout = () => {
-    setUser(null);
-    localStorage.removeItem('smartpix_user');
+  const logout = async () => {
+    const { error } = await supabase.auth.signOut();
+    if (error) {
+      console.error('Error signing out:', error);
+    }
   };
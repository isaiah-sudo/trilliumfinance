'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ClassroomSettings } from '@/types/education';

export type UserRole = 'student' | 'teacher' | 'regular';

interface DashboardSettingsContextProps {
  role: UserRole;
  classCode: string | null;
  classId: string | null;
  className: string | null;
  settings: ClassroomSettings;
  loading: boolean;
  teacherPreviewMode: boolean;
  setTeacherPreviewMode: (val: boolean) => void;
}

const defaultSettings: ClassroomSettings = {
  startingBalance: 100000,
  allowShortSelling: true,
  allowOptions: true,
  maxPositions: 9999,
  restrictedAssets: [],
};

const DashboardSettingsContext = createContext<DashboardSettingsContextProps | undefined>(undefined);

export function DashboardSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('regular');
  const [classCode, setClassCode] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [className, setClassName] = useState<string | null>(null);
  const [settings, setSettings] = useState<ClassroomSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [teacherPreviewMode, setTeacherPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setRole('regular');
      setClassCode(null);
      setClassId(null);
      setClassName(null);
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to user profile document
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(
      userRef,
      (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userRole = (userData.role as UserRole) || 'regular';
          const uClassCode = userData.classCode || null;
          const uClassId = userData.classId || null;

          setRole(userRole);
          setClassCode(uClassCode);
          setClassId(uClassId);

          if (userRole === 'student' && uClassId) {
            // Subscribe to student's classroom rules
            const classRef = doc(db, 'classrooms', uClassId);
            const unsubscribeClass = onSnapshot(classRef, (classSnap) => {
              if (classSnap.exists()) {
                const classData = classSnap.data();
                setClassName(classData.className || null);
                setSettings({
                  startingBalance: classData.settings?.startingBalance ?? 100000,
                  allowShortSelling: classData.settings?.allowShortSelling ?? true,
                  allowOptions: classData.settings?.allowOptions ?? true,
                  maxPositions: classData.settings?.maxPositions ?? 10,
                  restrictedAssets: classData.settings?.restrictedAssets ?? [],
                });
              }
              setLoading(false);
            });
            return () => unsubscribeClass();
          } else if (userRole === 'teacher' && uClassId) {
            // Subscribe to teacher's classroom rules to keep settings synced
            const classRef = doc(db, 'classrooms', uClassId);
            const unsubscribeClass = onSnapshot(classRef, (classSnap) => {
              if (classSnap.exists()) {
                const classData = classSnap.data();
                setClassName(classData.className || null);
                setSettings({
                  startingBalance: classData.settings?.startingBalance ?? 100000,
                  allowShortSelling: classData.settings?.allowShortSelling ?? true,
                  allowOptions: classData.settings?.allowOptions ?? true,
                  maxPositions: classData.settings?.maxPositions ?? 10,
                  restrictedAssets: classData.settings?.restrictedAssets ?? [],
                });
              }
              setLoading(false);
            });
            return () => unsubscribeClass();
          } else {
            setSettings(defaultSettings);
            setLoading(false);
          }
        } else {
          setRole('regular');
          setSettings(defaultSettings);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching user profile snapshot:', err);
        setRole('regular');
        setSettings(defaultSettings);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeUser();
    };
  }, [user]);

  // Compute effective settings based on teacherPreviewMode
  const effectiveSettings = React.useMemo(() => {
    if (role === 'teacher' && !teacherPreviewMode) {
      // In teacher dashboard controls we might want to see default behavior or unblocked preview
      return defaultSettings;
    }
    return settings;
  }, [role, settings, teacherPreviewMode]);

  return (
    <DashboardSettingsContext.Provider
      value={{
        role,
        classCode,
        classId,
        className,
        settings: effectiveSettings,
        loading,
        teacherPreviewMode,
        setTeacherPreviewMode,
      }}
    >
      {children}
    </DashboardSettingsContext.Provider>
  );
}

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext);
  if (!context) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
}

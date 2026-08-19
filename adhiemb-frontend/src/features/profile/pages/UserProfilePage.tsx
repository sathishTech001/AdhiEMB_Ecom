import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Lock, 
  Camera, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  KeyRound, 
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function UserProfilePage() {
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || 'Sathish',
      lastName: user?.lastName || 'Kumar',
      phone: '+91 98765 43210',
      bio: 'Senior Embroidery Digitizer & Platform Administrator.',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPasswordValue = watchPassword('newPassword', '');

  // Calculate password strength
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (!pw) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 50) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 75) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const pwStrength = getPasswordStrength(newPasswordValue);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const onSaveProfile = (_data: ProfileFormData) => {
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const onChangePassword = (_data: PasswordFormData) => {
    setPasswordSuccess(true);
    resetPasswordForm();
    setTimeout(() => setPasswordSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Account Profile Settings
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Sparkles className="h-3 w-3" /> Account Hub
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account credentials, avatar image, personal details and security preferences
        </p>
      </div>

      {/* User Hero Banner */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-black text-white shadow-lg overflow-hidden ring-4 ring-white dark:ring-slate-900">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                getInitials(user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Admin')
              )}
            </div>

            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition-transform hover:scale-110 active:scale-95">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Sathish Kumar'}
              </h2>
              <Badge variant="primary">
                {typeof user?.role === 'object' ? user.role.name : (user?.role || 'Administrator')}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || 'admin@adhiemb.com'}</p>
            <p className="text-xs text-slate-400 pt-1">
              Member of AdhiEMB Digital Marketplace since January 2026
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Personal Details Form */}
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Personal Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your name, contact phone, and profile bio
              </p>
            </div>

            {profileSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitProfile(onSaveProfile)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                error={profileErrors.firstName?.message}
                {...registerProfile('firstName')}
              />
              <Input
                label="Last Name"
                error={profileErrors.lastName?.message}
                {...registerProfile('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              value={user?.email || 'admin@adhiemb.com'}
              disabled
              className="bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed text-slate-500"
            />

            <Input
              label="Phone Number"
              error={profileErrors.phone?.message}
              {...registerProfile('phone')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio / Designer Profile Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                {...registerProfile('bio')}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form with Strength Meter */}
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Change Password & Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ensure your account is using a long, random password to stay secure
              </p>
            </div>

            {passwordSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Password Updated!
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrentPw ? 'text' : 'password'}
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type={showNewPw ? 'text' : 'password'}
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPasswordValue && (
              <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Password Strength:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {pwStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                  <div
                    className={`h-full transition-all duration-300 ${pwStrength.color}`}
                    style={{ width: `${pwStrength.score}%` }}
                  />
                </div>
              </div>
            )}

            <Input
              label="Confirm New Password"
              type="password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword')}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" leftIcon={<Lock className="h-4 w-4" />}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

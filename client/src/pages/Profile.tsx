import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FormInputWrapper } from "@/components/ui/form";

export function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      // TODO: Implement password update
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Failed to update password');
    }
  };

  return (
    <div className="container-responsive space-responsive">
      <div>
        <h1 className="text-heading">Profile Settings</h1>
        <p className="text-responsive text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-responsive">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card-responsive">
            <div className="card-header-responsive">
              <h3 className="text-subheading">Profile Information</h3>
              <p className="text-responsive text-muted-foreground">
                Update your personal information
              </p>
            </div>
            <div className="card-content-responsive">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {error && (
                  <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-600 text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
                    {success}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInputWrapper label="Full Name" required>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-responsive"
                      placeholder="Enter your full name"
                    />
                  </FormInputWrapper>
                  <FormInputWrapper label="Email address" required>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-responsive"
                      placeholder="Enter your email"
                    />
                  </FormInputWrapper>
                  <FormInputWrapper label="Phone Number">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-responsive"
                      placeholder="Enter your phone number"
                    />
                  </FormInputWrapper>
                  <FormInputWrapper label="Company">
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="input-responsive"
                      placeholder="Enter your company"
                    />
                  </FormInputWrapper>
                  <FormInputWrapper label="Position">
                    <input
                      id="position"
                      name="position"
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="input-responsive"
                      placeholder="Enter your position"
                    />
                  </FormInputWrapper>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-4">
          <div className="card-responsive">
            <div className="card-header-responsive">
              <h3 className="text-subheading">Profile Summary</h3>
            </div>
            <div className="card-content-responsive space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">{name}</h4>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="text-sm">{phone}</span>
                  </div>
                )}
                {company && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Company:</span>
                    <span className="text-sm">{company}</span>
                  </div>
                )}
                {position && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Position:</span>
                    <span className="text-sm">{position}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
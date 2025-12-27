import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { User, Mail, Shield, Camera, Save, Clock } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth(); // login used to update context state if needed, or we might need a setUser in context
    const [activeTab, setActiveTab] = useState('overview');
    const [history, setHistory] = useState([]);

    // Form State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(user?.avatar || null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/users/${user._id}/history`);
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history");
            }
        };
        fetchHistory();
    }, [user._id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (password) formData.append('password', password);
        if (avatar) formData.append('avatar', avatar);

        try {
            const { data } = await axios.put('http://localhost:5000/api/auth/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Profile Updated Successfully');
            // Update local storage and context roughly (page reload might be needed to refresh full context cleanly if we don't expose setUser)
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                            {preview && !preview.includes('default-avatar') ? (
                                <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-3xl">
                                    {user?.name?.[0]}
                                </div>
                            )}
                        </div>
                        {activeTab === 'settings' && (
                            <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                                <Camera className="h-4 w-4" />
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold">{user?.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {user?.email}</span>
                            <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> {user?.role}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === 'overview' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </Button>
                        <Button
                            variant={activeTab === 'settings' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('settings')}
                        >
                            Edit Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            {activeTab === 'overview' ? (
                <div className="grid gap-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Activity History
                    </h2>
                    {history.length > 0 ? (
                        <div className="space-y-4">
                            {history.map(item => (
                                <Card key={item._id} className="hover:shadow-sm transition-shadow">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{item.subject}</p>
                                            <p className="text-sm text-muted-foreground">Equipment: {item.equipment?.name}</p>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Badge variant={item.status === 'Repaired' ? 'default' : 'secondary'}>
                                            {item.status}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-lg">
                            No history found.
                        </div>
                    )}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                            <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email Address</label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">New Password (Optional)</label>
                                <Input
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Profile;

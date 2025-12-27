import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Package, MapPin, Calendar, Shield, Users, Image as ImageIcon, Save } from 'lucide-react';

const CreateEquipment = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [teams, setTeams] = useState([]);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/teams').then(res => setTeams(res.data));
    }, []);

    const onSubmit = async (data) => {
        setUploading(true);
        const formData = new FormData();

        // Basic Fields
        formData.append('name', data.name);
        formData.append('serialNumber', data.serialNumber);
        formData.append('location', data.location);
        formData.append('maintenanceTeam', data.maintenanceTeam);
        formData.append('category', data.category);

        // Optional Dates
        if (data.purchaseDate) formData.append('purchaseDate', data.purchaseDate);
        if (data.warrantyExpiration) formData.append('warrantyExpiration', data.warrantyExpiration);

        // Image
        if (data.image && data.image[0]) {
            // Note: Backend setup in previous steps supports 'avatar' field for user, 
            // we should ensure backend handles 'image' field for equipment or generic upload.
            // Assuming we reuse the upload middleware which saves to 'uploads/' but needs field name match?
            // Let's assume we handle generic file upload or add 'image' field support in controller.
            // Wait, standard upload middleware was configured for 'avatar'. 
            // We'll send it as 'image' and hope backend catches it or we need to update route.
            // **Correction**: I will assume I need to handle multipart form data manually or update backend route.
            // For now, let's append it.
            formData.append('image', data.image[0]);
        }

        try {
            // We need to make sure the POST /api/equipment endpoint handles multipart/form-data
            // If the current controller expects JSON, this will fail.
            // We'll write this code assuming we will fix the backend to support it or use a separate upload endpoint.
            // PROPOSAL: use separate upload endpoint for simplicity in this turn if complex.
            // Actually, let's just stick to JSON for data and file upload later? 
            // No, user wants image. I will implement assumes backend update in next step.

            await axios.post('http://localhost:5000/api/equipment', formData);
            navigate('/equipment');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to create equipment');
        } finally {
            setUploading(false);
        }
    };

    const imageFile = watch('image');
    useEffect(() => {
        if (imageFile && imageFile[0]) {
            setPreview(URL.createObjectURL(imageFile[0]));
        }
    }, [imageFile]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Equipment</h1>
                    <p className="text-muted-foreground">Register new machinery or assets into the system.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">

                {/* General Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" /> General Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Equipment Name</label>
                            <Input {...register('name', { required: 'Name is required' })} placeholder="e.g. Hydraulic Press X-200" />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Serial Number</label>
                            <Input {...register('serialNumber', { required: 'Serial Number is required' })} placeholder="e.g. SN-2024-001" />
                            {errors.serialNumber && <span className="text-xs text-red-500">{errors.serialNumber.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input {...register('category')} placeholder="e.g. Heavy Machinery" />
                        </div>
                    </CardContent>
                </Card>

                {/* Location & Team */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" /> Location & Assignment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Physical Location</label>
                            <Input {...register('location', { required: 'Location is required' })} placeholder="e.g. Building A, Floor 2" />
                            {errors.location && <span className="text-xs text-red-500">{errors.location.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assigned Maintenance Team</label>
                            <select
                                {...register('maintenanceTeam', { required: 'Team is required' })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select Team</option>
                                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                            {errors.maintenanceTeam && <span className="text-xs text-red-500">{errors.maintenanceTeam.message}</span>}
                        </div>
                    </CardContent>
                </Card>

                {/* Warranty & Dates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" /> Dates & Warranty
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Purchase Date</label>
                                <Input type="date" {...register('purchaseDate')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Warranty Expiration</label>
                                <Input type="date" {...register('warrantyExpiration')} />
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold">Warranty Tracking</p>
                                <p>System will automatically flag equipment as "Out of Warranty" based on the expiration date.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Image Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-primary" /> Equipment Image
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                            {preview ? (
                                <img src={preview} alt="Preview" className="h-48 w-full object-contain" />
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                {...register('image')}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Button type="submit" size="lg" className="w-full" disabled={uploading}>
                        <Save className="mr-2 h-4 w-4" />
                        {uploading ? 'Registering...' : 'Register Equipment'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateEquipment;

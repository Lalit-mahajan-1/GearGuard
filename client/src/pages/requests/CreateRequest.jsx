import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const CreateRequest = () => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [equipmentList, setEquipmentList] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/equipment').then(res => setEquipmentList(res.data));
    }, []);

    const onSubmit = async (data) => {
        try {
            await axios.post('http://localhost:5000/api/requests', data);
            navigate('/requests');
        } catch (error) {
            console.error(error);
            alert('Failed to create request');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create Maintenance Request</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Equipment & Subject */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input {...register('subject', { required: true })} placeholder="e.g. Broken Belt" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Equipment</label>
                                <select
                                    {...register('equipment', { required: true })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Select Equipment</option>
                                    {equipmentList.map(eq => (
                                        <option key={eq._id} value={eq._id}>{eq.name} ({eq.serialNumber})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                {...register('description', { required: true })}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe the issue in detail..."
                            />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select {...register('type')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="Corrective">Corrective</option>
                                    <option value="Preventive">Preventive</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <select {...register('priority')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Scheduled Date</label>
                                <Input type="date" {...register('scheduledDate')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assign Team (Override)</label>
                                <select {...register('assignedTeam')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="">Auto-Assign (Default)</option>
                                    {/* Ideally we fetch teams here too, but for speed relying on backend auto-assign if empty */}
                                </select>
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full">Submit Request</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateRequest;

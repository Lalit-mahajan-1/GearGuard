import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Wrench } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setError('');
        const result = await login(data.email, data.password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-2">
                        <Wrench className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl text-center">Sign in to GearGuard</CardTitle>
                    <p className="text-sm text-muted-foreground">Enter your email and password to access the system</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="name@example.com"
                                type="email"
                                {...register('email')}
                                className={errors.email ? "border-destructive" : ""}
                            />
                            {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Password"
                                type="password"
                                {...register('password')}
                                className={errors.password ? "border-destructive" : ""}
                            />
                            {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
                        </div>

                        {error && <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-2 rounded">{error}</div>}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </Button>

                        {/* Demo Credentials Hint */}
                        <div className="text-xs text-muted-foreground text-center mt-4">
                            <p>Demo: admin@example.com / 123456</p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;

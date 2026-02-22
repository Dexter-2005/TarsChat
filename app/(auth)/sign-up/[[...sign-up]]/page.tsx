import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                        Tars Chat
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Create your account to get started
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-card border border-border shadow-xl",
                        },
                    }}
                />
            </div>
        </div>
    );
}

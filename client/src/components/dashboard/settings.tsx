import { useCurrentUser } from "@/hooks/use-current-user";
import { useSubscription } from "@/hooks/use-subscription";
import { api } from "@/lib/api";
import stripePromise from "@/lib/stripe";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Check } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

export default function Settings() {
  const {
    subscriptionStatus,
    isSubscriptionLoading,
    isSubscriptionError,
    setLoading,
  } = useSubscription();
  const { user } = useCurrentUser();
  console.log(subscriptionStatus);

  if (!subscriptionStatus) {
    return null;
  }

  const isActive = subscriptionStatus.status === "active";

  const handleUpgrade = async () => {
    setLoading(true);
    if (!isActive) {
      try {
        const response = await api.get("/payments/create-checkout-session");
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({
          sessionId: response.data.sessionId,
        });
      } catch (error) {
        toast.error("Please try again or login to your account");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("You are already a premium member");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={user.displayName}
                id="name"
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={user.email}
                id="email"
                readOnly
                className="bg-gray-100"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your account is managed through Google. If you want to change your
              email, please contact us.
            </p>
          </CardContent>
        </Card>

        {isActive ? (
          <Card>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Your membership details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-md bg-green-600/10 p-1 pr-2 text-xs font-medium text-green-600">
                    <div className="m-0.5 rounded-full bg-green-600/10 p-[3px]">
                      <Check size={16} className="text-foreground" />
                    </div>
                    Active membership
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lifetime membership granted
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p>
                  Thank you for your support. Enjoy the benefits of premium.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary border-2 shadow-lg">
            <CardHeader>
              <CardTitle>Get unlimted access forever</CardTitle>
              <CardDescription>
                Upgrade to premium and enjoy unlimited access to all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-foreground" />
                  <p>Unlimited access to all features</p>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-foreground" />
                  <p>Unlimited access to all features</p>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-foreground" />
                  <p>Unlimited access to all features</p>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleUpgrade}
                variant={"outline"}
              >
                Purchase Lifetime Membership
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

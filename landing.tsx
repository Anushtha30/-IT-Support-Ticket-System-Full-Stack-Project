import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, Users, Clock, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <Headphones className="inline-block text-blue-600 mr-2" size={24} />
                IT Support Portal
              </h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/?demo=student'}>
                Demo as Student
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/?demo=admin'}>
                Demo as Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            University IT Support
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get help with your IT issues quickly and efficiently. Submit tickets, track progress, and stay connected with our support team.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/?demo=student'}
                className="w-full sm:w-auto"
              >
                Try as Student
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/?demo=admin'}
                className="w-full sm:w-auto"
              >
                Try as Admin
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="text-center">
                <Headphones className="mx-auto h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Round-the-clock assistance for all your IT needs
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Clock className="mx-auto h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Fast Response</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Quick ticket resolution with real-time status updates
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="mx-auto h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Expert Team</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Experienced IT professionals ready to help
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="mx-auto h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Your data and communications are always protected
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

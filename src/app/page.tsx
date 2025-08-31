import Image from "next/image";
import Link from "next/link";
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  UserGroupIcon,
  HomeIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">MaidService</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find <span className="text-indigo-600">Professional Maids</span>
            <br />Near You
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Book verified, professional household services including housekeeping, 
            deep cleaning, cooking, and more. Trusted help is just a click away.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-md hover:bg-indigo-700">
                Search
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <SparklesIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Service</h3>
              <p className="text-gray-600">Verified professionals with excellent ratings</p>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Background Checked</h3>
              <p className="text-gray-600">All maids undergo thorough background verification</p>
            </div>
            <div className="text-center">
              <ClockIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Timing</h3>
              <p className="text-gray-600">Book services at your convenient time</p>
            </div>
            <div className="text-center">
              <UserGroupIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Platform</h3>
              <p className="text-gray-600">Join thousands of satisfied customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive household services to make your life easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Housekeeping', desc: 'Regular cleaning and maintenance', price: 'From ₹300/hr' },
              { name: 'Deep Cleaning', desc: 'Thorough cleaning for your home', price: 'From ₹500/hr' },
              { name: 'Cooking', desc: 'Meal preparation and kitchen management', price: 'From ₹400/hr' },
              { name: 'Laundry', desc: 'Washing, drying, and ironing services', price: 'From ₹250/hr' },
              { name: 'Babysitting', desc: 'Professional childcare services', price: 'From ₹450/hr' },
              { name: 'Elderly Care', desc: 'Compassionate care for seniors', price: 'From ₹600/hr' },
              { name: 'Pet Care', desc: 'Pet sitting and walking services', price: 'From ₹350/hr' },
              { name: 'Gardening', desc: 'Garden maintenance and landscaping', price: 'From ₹400/hr' }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <p className="text-indigo-600 font-medium">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of satisfied customers and find your perfect maid today
          </p>
          <Link href="/auth/signup" className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Book Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <HomeIcon className="h-6 w-6 text-indigo-400 mr-2" />
                <span className="text-lg font-bold">MaidService</span>
              </div>
              <p className="text-gray-400">
                Professional household services at your fingertips
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Housekeeping</li>
                <li>Deep Cleaning</li>
                <li>Cooking</li>
                <li>Laundry</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Safety</li>
                <li>Terms of Service</li>
                <li>Community Guidelines</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MaidService. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


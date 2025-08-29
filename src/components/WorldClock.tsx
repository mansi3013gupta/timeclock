import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Clock, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Timezone {
  id: string;
  timezone: string;
  city: string;
  country: string;
  datetime: string;
  utc_offset: string;
}

// Popular timezones for autocomplete
const POPULAR_TIMEZONES = [
  { timezone: 'America/New_York', city: 'New York', country: 'United States' },
  { timezone: 'America/Los_Angeles', city: 'Los Angeles', country: 'United States' },
  { timezone: 'Europe/London', city: 'London', country: 'United Kingdom' },
  { timezone: 'Europe/Paris', city: 'Paris', country: 'France' },
  { timezone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan' },
  { timezone: 'Asia/Shanghai', city: 'Shanghai', country: 'China' },
  { timezone: 'Australia/Sydney', city: 'Sydney', country: 'Australia' },
  { timezone: 'Asia/Dubai', city: 'Dubai', country: 'UAE' },
  { timezone: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brazil' },
  { timezone: 'Asia/Kolkata', city: 'Mumbai', country: 'India' },
];

const WorldClock = () => {
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTimezones, setFilteredTimezones] = useState(POPULAR_TIMEZONES);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  // Update times every minute using built-in timezone functionality
  useEffect(() => {
    if (timezones.length === 0) return;

    const updateTimes = () => {
      const now = new Date();
      const updatedTimezones = timezones.map(tz => {
        // Use JavaScript's built-in timezone functionality
        const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: tz.timezone}));
        const utcTime = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
        
        // Calculate UTC offset
        const offsetInMinutes = (timeInTimezone.getTime() - utcTime.getTime()) / (1000 * 60);
        const offsetHours = Math.floor(Math.abs(offsetInMinutes) / 60);
        const offsetMins = Math.abs(offsetInMinutes) % 60;
        const offsetSign = offsetInMinutes >= 0 ? '+' : '-';
        const utc_offset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;
        
        return {
          ...tz,
          datetime: timeInTimezone.toISOString(),
          utc_offset: utc_offset
        };
      });
      setTimezones(updatedTimezones);
    };

    // Update immediately, then every minute
    updateTimes();
    const interval = setInterval(updateTimes, 60000);
    return () => clearInterval(interval);
  }, [timezones.length]);

  // Filter timezones based on search
  useEffect(() => {
    const filtered = POPULAR_TIMEZONES.filter(
      tz => 
        tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTimezones(filtered);
  }, [searchQuery]);

  const addTimezone = (timezoneData: { timezone: string; city: string; country: string }) => {
    // Check if already added
    if (timezones.find(tz => tz.timezone === timezoneData.timezone)) {
      toast({
        title: "Already added",
        description: `${timezoneData.city} is already in your world clock.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Use JavaScript's built-in timezone functionality
      const now = new Date();
      const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: timezoneData.timezone}));
      const utcTime = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
      
      // Calculate UTC offset
      const offsetInMinutes = (timeInTimezone.getTime() - utcTime.getTime()) / (1000 * 60);
      const offsetHours = Math.floor(Math.abs(offsetInMinutes) / 60);
      const offsetMins = Math.abs(offsetInMinutes) % 60;
      const offsetSign = offsetInMinutes >= 0 ? '+' : '-';
      const utc_offset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')}`;

      const newTimezone: Timezone = {
        id: Date.now().toString(),
        timezone: timezoneData.timezone,
        city: timezoneData.city,
        country: timezoneData.country,
        datetime: timeInTimezone.toISOString(),
        utc_offset: utc_offset,
      };
      
      setTimezones(prev => [...prev, newTimezone]);
      setSearchQuery('');
      setIsSearchOpen(false);
      toast({
        title: "Timezone added",
        description: `${timezoneData.city} has been added to your world clock.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add ${timezoneData.city}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const removeTimezone = (id: string) => {
    setTimezones(prev => prev.filter(tz => tz.id !== id));
  };

  const formatTime = (timezone: string) => {
    return new Date().toLocaleTimeString([], { 
      timeZone: timezone,
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timezone: string) => {
    return new Date().toLocaleDateString([], { 
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              World Clock
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track time across different countries and timezones
          </p>
        </div>

        {/* Search Section */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(e.target.value.length > 0);
              }}
              onFocus={() => setIsSearchOpen(searchQuery.length > 0)}
              placeholder="Search for a city or country..."
              className="pl-10 bg-gradient-card border-border text-foreground placeholder:text-muted-foreground shadow-card"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <Card className="absolute top-full left-0 right-0 mt-2 p-2 bg-gradient-card border-border shadow-elegant z-10">
              <div className="max-h-60 overflow-y-auto">
                {filteredTimezones.length > 0 ? (
                  filteredTimezones.map((tz) => (
                    <div
                      key={tz.timezone}
                      onClick={() => addTimezone(tz)}
                      className="flex items-center justify-between p-3 hover:bg-accent rounded-lg cursor-pointer transition-smooth"
                    >
                      <div>
                        <div className="font-medium text-foreground">{tz.city}</div>
                        <div className="text-sm text-muted-foreground">{tz.country}</div>
                      </div>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground">
                    No cities found
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Timezone Cards */}
      <div className="max-w-6xl mx-auto">
        {timezones.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No timezones added yet</h3>
            <p className="text-muted-foreground">Search for a city above to start tracking time around the world</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {timezones.map((tz) => (
              <Card key={tz.id} className="relative bg-gradient-card border-border shadow-card hover:shadow-glow-secondary transition-smooth overflow-hidden">
                <div className="p-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimezone(tz.id)}
                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{tz.city}</h3>
                    <p className="text-sm text-muted-foreground">{tz.country}</p>
                  </div>
                  
                   <div className="space-y-2">
                     <div className="text-3xl font-bold text-primary font-mono">
                       {formatTime(tz.timezone)}
                     </div>
                     <div className="text-sm text-muted-foreground">
                       {formatDate(tz.timezone)}
                     </div>
                     <div className="text-xs text-muted-foreground">
                       UTC{tz.utc_offset}
                     </div>
                   </div>
                </div>
                
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldClock;
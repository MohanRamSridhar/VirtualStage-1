import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEvents } from "@/lib/stores/useEvents";

export default function EventFilter() {
  const { events, setFilters, clearFilters } = useEvents();
  
  // Extract unique values from events
  const [genres, setGenres] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  
  // Current selections
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [onlyLive, setOnlyLive] = useState(false);
  const [onlyPremium, setOnlyPremium] = useState(false);
  
  // Extract filter options from events
  useEffect(() => {
    if (events.length > 0) {
      const uniqueGenres = [...new Set(events.map(event => event.genre))];
      const uniqueTypes = [...new Set(events.map(event => event.type))];
      const uniqueArtists = [...new Set(events.map(event => event.artist))];
      
      setGenres(uniqueGenres);
      setTypes(uniqueTypes);
      setArtists(uniqueArtists);
    }
  }, [events]);
  
  // Apply filters
  const applyFilters = () => {
    const filters: Record<string, any> = {};
    
    if (selectedGenres.length === 1) {
      filters.genre = selectedGenres[0];
    }
    
    if (selectedTypes.length === 1) {
      filters.type = selectedTypes[0];
    }
    
    if (selectedArtists.length === 1) {
      filters.artist = selectedArtists[0];
    }
    
    if (onlyLive) {
      filters.isLive = true;
    }
    
    if (onlyPremium) {
      filters.isPremium = true;
    }
    
    setFilters(filters);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedTypes([]);
    setSelectedArtists([]);
    setOnlyLive(false);
    setOnlyPremium(false);
    clearFilters();
  };
  
  // Handle genre change
  const handleGenreChange = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };
  
  // Handle type change
  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Handle artist change
  const handleArtistChange = (artist: string) => {
    setSelectedArtists(prev => 
      prev.includes(artist) 
        ? prev.filter(a => a !== artist) 
        : [...prev, artist]
    );
  };
  
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Filter Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple" defaultValue={["types", "genres"]}>
          {/* Event Types */}
          <AccordionItem value="types">
            <AccordionTrigger>Event Types</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {types.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`type-${type}`} 
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => handleTypeChange(type)}
                    />
                    <label htmlFor={`type-${type}`} className="text-sm capitalize">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Genres */}
          <AccordionItem value="genres">
            <AccordionTrigger>Genres</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {genres.map(genre => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`genre-${genre}`} 
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => handleGenreChange(genre)}
                    />
                    <label htmlFor={`genre-${genre}`} className="text-sm capitalize">
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Artists */}
          <AccordionItem value="artists">
            <AccordionTrigger>Artists</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {artists.map(artist => (
                  <div key={artist} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`artist-${artist}`} 
                      checked={selectedArtists.includes(artist)}
                      onCheckedChange={() => handleArtistChange(artist)}
                    />
                    <label htmlFor={`artist-${artist}`} className="text-sm">
                      {artist}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Other Filters */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium">Additional Filters</h3>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="live-only" 
              checked={onlyLive}
              onCheckedChange={(checked) => setOnlyLive(checked === true)}
            />
            <label htmlFor="live-only" className="text-sm">
              Live Events Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="premium-only" 
              checked={onlyPremium}
              onCheckedChange={(checked) => setOnlyPremium(checked === true)}
            />
            <label htmlFor="premium-only" className="text-sm">
              Premium Events Only
            </label>
          </div>
        </div>
        
        <Separator />
        
        {/* Filter actions */}
        <div className="flex gap-2">
          <Button variant="default" onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

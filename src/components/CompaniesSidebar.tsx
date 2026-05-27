import { useState } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface CompaniesSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const CompaniesSidebar = ({ isCollapsed, onToggle }: CompaniesSidebarProps) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [marketCap, setMarketCap] = useState([0, 3000]);
  const [sentiment, setSentiment] = useState([0, 100]);
  const [toneGap, setToneGap] = useState(30);
  const [highPriorityRisks, setHighPriorityRisks] = useState(false);

  const sectors = ["Technology", "Healthcare", "Financial", "Consumer", "Industrial"];

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-card border-r border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 hover:bg-surface-elevated"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-[calc(100vh-60px)] sticky top-[60px]">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm text-foreground">Screening Filters</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 hover:bg-surface-elevated"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Sector */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-text-secondary">Sector</Label>
          <div className="space-y-2">
            {sectors.map((sector) => (
              <div key={sector} className="flex items-center gap-2">
                <Checkbox
                  id={sector}
                  checked={selectedSectors.includes(sector)}
                  onCheckedChange={() => toggleSector(sector)}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor={sector}
                  className="text-xs text-foreground cursor-pointer"
                >
                  {sector}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Market Cap */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-text-secondary">
            Market Cap (B)
          </Label>
          <div className="px-2 py-3">
            <Slider
              value={marketCap}
              onValueChange={setMarketCap}
              max={3000}
              step={50}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>${marketCap[0]}B</span>
            <span>${marketCap[1]}B</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Overall Sentiment */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-text-secondary">
            Overall Sentiment
          </Label>
          <div className="px-2 py-3">
            <Slider
              value={sentiment}
              onValueChange={setSentiment}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{sentiment[0]}</span>
            <span>{sentiment[1]}</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Tone Gap Threshold */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-text-secondary">
            Tone Gap Threshold
          </Label>
          <Input
            type="number"
            value={toneGap}
            onChange={(e) => setToneGap(Number(e.target.value))}
            className="h-8 text-xs bg-surface-elevated border-border"
          />
        </div>

        <Separator className="bg-border" />

        {/* High-Priority Risks */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-text-secondary">
            Has High-Priority Risks
          </Label>
          <Switch
            checked={highPriorityRisks}
            onCheckedChange={setHighPriorityRisks}
            className="h-5 w-9"
          />
        </div>

        <Separator className="bg-border" />

        {/* Saved Filters */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-text-secondary">
            Saved Filters
          </Label>
          <Select>
            <SelectTrigger className="h-8 text-xs bg-surface-elevated border-border">
              <SelectValue placeholder="Load saved filter..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="tech-leaders" className="text-xs">
                Tech Leaders
              </SelectItem>
              <SelectItem value="high-risk" className="text-xs">
                High Risk Companies
              </SelectItem>
              <SelectItem value="top-sentiment" className="text-xs">
                Top Sentiment
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <Button className="w-full h-8 text-xs bg-primary hover:bg-primary/90">
          <Save className="h-3 w-3 mr-1.5" />
          Save Current Filter
        </Button>
      </div>
    </aside>
  );
};

export default CompaniesSidebar;

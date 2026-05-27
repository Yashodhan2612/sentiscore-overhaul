import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Camera, Lock, Edit2, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";

interface CompanyAnalysis {
  ticker: string;
  name: string;
  quarter: string;
  sentiment: number;
  lastUpdated: string;
}

const Profile = () => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState("John Doe");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [newAnalysisCompany, setNewAnalysisCompany] = useState("");
  const [newAnalysisQuarter, setNewAnalysisQuarter] = useState("");

  // Mock data - replace with actual API calls
  const userInfo = {
    username: "johndoe",
    email: "john.doe@hedgefund.com",
    profilePicture: "",
  };

  const analyses: CompanyAnalysis[] = [
    { ticker: "AAPL", name: "Apple Inc.", quarter: "Q4-2024", sentiment: 78, lastUpdated: "2024-10-15" },
    { ticker: "MSFT", name: "Microsoft", quarter: "Q3-2024", sentiment: 82, lastUpdated: "2024-09-20" },
    { ticker: "GOOGL", name: "Alphabet Inc.", quarter: "Q4-2024", sentiment: 65, lastUpdated: "2024-10-18" },
    { ticker: "NVDA", name: "NVIDIA", quarter: "Q3-2024", sentiment: 88, lastUpdated: "2024-09-25" },
    { ticker: "TSLA", name: "Tesla", quarter: "Q4-2024", sentiment: 52, lastUpdated: "2024-10-20" },
  ];

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const years = ["2024", "2023", "2022"];

  const filteredAnalyses = analyses.filter((analysis) => {
    const quarterMatch = selectedQuarter === "all" || analysis.quarter.startsWith(selectedQuarter);
    const yearMatch = analysis.quarter.endsWith(selectedYear);
    return quarterMatch && yearMatch;
  });

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 70) return <TrendingUp className="h-4 w-4" />;
    if (sentiment <= 50) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return "text-positive";
    if (sentiment <= 50) return "text-negative";
    return "text-caution";
  };

  const handleSaveName = () => {
    // Save name logic here
    setIsEditingName(false);
  };

  const handleChangePassword = () => {
    // Password change logic here
    setIsPasswordDialogOpen(false);
  };

  const handleAddAnalysis = () => {
    // Add analysis logic here
    console.log("Adding analysis for", newAnalysisCompany, newAnalysisQuarter);
    setNewAnalysisCompany("");
    setNewAnalysisQuarter("");
  };

  return (
    <Layout breadcrumbs={[{ label: "Profile", href: "/profile" }]}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Information Section */}
        <Card className="bg-card border-border">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Profile Information</h2>
            
            <div className="flex items-start gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userInfo.profilePicture} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Upload
                </Button>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label className="text-text-secondary">Full Name</Label>
                  <div className="flex gap-2">
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditingName}
                      className="bg-surface-elevated border-border"
                    />
                    {isEditingName ? (
                      <Button onClick={handleSaveName} size="sm">Save</Button>
                    ) : (
                      <Button onClick={() => setIsEditingName(true)} variant="outline" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-text-secondary">Username</Label>
                  <Input
                    value={userInfo.username}
                    disabled
                    className="bg-surface-elevated border-border opacity-60"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-text-secondary">Email</Label>
                  <Input
                    value={userInfo.email}
                    disabled
                    className="bg-surface-elevated border-border opacity-60"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label className="text-text-secondary">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value="••••••••"
                      disabled
                      className="bg-surface-elevated border-border opacity-60"
                    />
                    <Button
                      onClick={() => setIsPasswordDialogOpen(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* User's Analysis Data Section */}
        <Card className="bg-card border-border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Your Company Analyses</h2>
              
              {/* Quarter/Year Filters */}
              <div className="flex gap-3">
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger className="w-32 bg-surface-elevated border-border">
                    <SelectValue placeholder="Quarter" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Quarters</SelectItem>
                    {quarters.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24 bg-surface-elevated border-border">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Analysis List */}
            <div className="space-y-3">
              {filteredAnalyses.length > 0 ? (
                filteredAnalyses.map((analysis) => (
                  <Link
                    key={`${analysis.ticker}-${analysis.quarter}`}
                    to={`/company/${analysis.ticker}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{analysis.ticker}</span>
                            <Badge variant="outline" className="text-xs">
                              {analysis.quarter}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary">{analysis.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-text-tertiary">Last Updated</p>
                          <p className="text-sm text-text-secondary">{analysis.lastUpdated}</p>
                        </div>
                        <div className={`flex items-center gap-2 ${getSentimentColor(analysis.sentiment)}`}>
                          {getSentimentIcon(analysis.sentiment)}
                          <span className="font-semibold text-lg">{analysis.sentiment}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  No analyses found for the selected period.
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Add New Analysis Section */}
        <Card className="bg-card border-border">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Add New Analysis</h2>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-text-secondary mb-2 block">Company</Label>
                <Input
                  placeholder="Search company name or ticker..."
                  value={newAnalysisCompany}
                  onChange={(e) => setNewAnalysisCompany(e.target.value)}
                  className="bg-surface-elevated border-border"
                />
              </div>

              <div className="w-48">
                <Label className="text-text-secondary mb-2 block">Quarter</Label>
                <Select value={newAnalysisQuarter} onValueChange={setNewAnalysisQuarter}>
                  <SelectTrigger className="bg-surface-elevated border-border">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {quarters.map((q) => (
                      years.map((y) => (
                        <SelectItem key={`${q}-${y}`} value={`${q}-${y}`}>
                          {q}-{y}
                        </SelectItem>
                      ))
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAddAnalysis}
                  disabled={!newAnalysisCompany || !newAnalysisQuarter}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Analysis
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Change Password</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-text-secondary">Current Password</Label>
              <Input type="password" className="bg-surface-elevated border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary">New Password</Label>
              <Input type="password" className="bg-surface-elevated border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary">Confirm New Password</Label>
              <Input type="password" className="bg-surface-elevated border-border" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;

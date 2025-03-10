import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { BookOpen, FileText, Video, Download } from "lucide-react";

export default function ResourcesPage() {
  const blogPosts = [
    {
      title: "5 Ways to Increase Client Retention with Technology",
      excerpt: "Discover how modern fitness professionals are using technology to improve client experience and boost retention rates.",
      category: "Business Growth",
      date: "2 June 2023",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=500&auto=format&fit=crop"
    },
    {
      title: "The Science Behind Effective Programme Design",
      excerpt: "Learn the key principles of exercise programming that lead to optimal results for your clients.",
      category: "Training Science",
      date: "15 May 2023",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=500&auto=format&fit=crop"
    },
    {
      title: "How to Price Your Online Coaching Services",
      excerpt: "A comprehensive guide to pricing strategies for fitness professionals in the digital space.",
      category: "Business Strategy",
      date: "3 May 2023",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=500&auto=format&fit=crop"
    },
  ];

  const caseStudies = [
    {
      title: "How FitStudio Increased Revenue by 43% in Six Months",
      excerpt: "Learn how a boutique fitness studio in London used PTpal to streamline operations and significantly boost revenue.",
      type: "Gym Case Study",
      results: "43% Revenue Increase",
      image: "https://images.unsplash.com/photo-1570829460005-c840387bb1ca?q=80&w=500&auto=format&fit=crop"
    },
    {
      title: "Personal Trainer Scales to 50+ Online Clients",
      excerpt: "Independent trainer James Wilson explains how automation helped him grow his client base without sacrificing quality.",
      type: "Trainer Case Study",
      results: "3x Client Growth",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop"
    },
  ];

  const guides = [
    {
      title: "Complete Guide to Personal Trainer Marketing",
      type: "PDF Guide",
      icon: <FileText size={24} className="text-primary" />,
      description: "A 28-page guide covering online and offline marketing strategies for fitness professionals."
    },
    {
      title: "Client Onboarding Templates Pack",
      type: "Template Bundle",
      icon: <Download size={24} className="text-primary" />,
      description: "Ready-to-use templates for onboarding new clients, including questionnaires and welcome materials."
    },
    {
      title: "Building a Profitable Online Fitness Business",
      type: "Video Course",
      icon: <Video size={24} className="text-primary" />,
      description: "A 5-part video series on creating, scaling, and optimising an online fitness business."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Resources for Fitness Professionals</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of guides, case studies, and insights to help you grow your fitness business and enhance your coaching practices.
          </p>
        </div>

        <Tabs defaultValue="blog" className="mb-16">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="caseStudies">Case Studies</TabsTrigger>
              <TabsTrigger value="guides">Guides & Templates</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="blog">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden flex flex-col h-full">
                  <div className="aspect-video w-full overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-primary font-medium">{post.category}</span>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    <Link href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Button variant="link" className="p-0">Read more</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/blog">
                <Button variant="outline">View all articles</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="caseStudies">
            <div className="grid md:grid-cols-2 gap-8">
              {caseStudies.map((study, index) => (
                <Card key={index} className="overflow-hidden flex flex-col h-full">
                  <div className="aspect-video w-full overflow-hidden">
                    <img src={study.image} alt={study.title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-primary font-medium">{study.type}</span>
                      <span className="text-sm font-semibold">{study.results}</span>
                    </div>
                    <CardTitle>{study.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{study.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/case-studies/${study.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Button>Read full case study</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guides">
            <div className="grid md:grid-cols-3 gap-8">
              {guides.map((guide, index) => (
                <Card key={index} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {guide.icon}
                      <span className="text-sm text-muted-foreground">{guide.type}</span>
                    </div>
                    <CardTitle>{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{guide.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/resources/${guide.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Button className="w-full">Download Resource</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Get the latest industry insights, business growth tips, and PTpal updates delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
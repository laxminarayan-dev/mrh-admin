"use client";
import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Loader2, ImageIcon, Upload, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// shadcn/ui components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const EditMenuItem = ({ initialData = null }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get("editId");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || "");
  const isEditMode = Boolean(editId || initialData);

  // 1. Unified Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    cuisine: initialData?.cuisine || "",
    includes: initialData?.includes || [],
    originalPrice: initialData?.originalPrice || "",
    discountPrice: initialData?.discountPrice || "",
    onSale: initialData?.onSale || false,
    specialItem: initialData?.specialItem || false,
    newArrival: initialData?.newArrival || false,
    bestSeller: initialData?.bestSeller || false,
    available: initialData?.available ?? true,
    stock: initialData?.stock || "",
    lowStockThreshold: initialData?.lowStockThreshold || 5,
    availableTimings: initialData?.availableTimings || [],
    days: initialData?.days || [],
    altText: initialData?.altText || "",
    prepTime: initialData?.prepTime || "",
  });

  // 2. File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload this to S3/Cloudinary and get a URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Fetch item when editId is present
  useEffect(() => {
    if (!editId) return;
    let mounted = true;
    (async () => {
      setLoadingItem(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${editId}`,
        );
        // if (!res.ok) {
        //   router.push("/inventory");
        //   return;
        // }
        const data = await res.json();
        if (!mounted) return;
        console.log("Fetched item for editing:", data);
        // Map server response into form shape
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          description: data.description || "",
          category: data.category || "",
          cuisine: data.cuisine || "",
          includes: data.includes || [],
          originalPrice: data.originalPrice || "",
          discountPrice: data.discountPrice || "",
          onSale: data.onSale || false,
          specialItem: data.specialItem || false,
          newArrival: data.newArrival || false,
          bestSeller: data.bestSeller || false,
          available: data.available ?? true,
          stock: data.stock || "",
          lowStockThreshold: data.lowStockThreshold || 5,
          altText: data.altText || "",
          prepTime: data.prepTime || "",
        }));
        setPreviewUrl(data.imageUrl || "");
        // Map server response into form shape (map backend fields)
        const mapTimings = (t) => {
          if (!t) return [];
          const res = [];
          if (t.breakfast) res.push("Breakfast");
          if (t.lunch) res.push("Lunch");
          if (t.dinner) res.push("Dinner");
          if (t.allDay) res.push("All Day");
          return res;
        };
        const mapDays = (d) =>
          Array.isArray(d) ? d.map((x) => x[0].toUpperCase() + x.slice(1)) : [];

        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          description: data.shortDescription || data.description || "",
          category: data.subCategory || data.category || "",
          cuisine: data.cuisine || "",
          includes: data.includes || [],

          originalPrice:
            data.originalPrice !== undefined && data.originalPrice !== null
              ? data.originalPrice
              : "",

          discountPrice:
            data.discountPrice !== undefined && data.discountPrice !== null
              ? data.discountPrice
              : "",

          stock:
            data.stock !== undefined && data.stock !== null ? data.stock : "",

          lowStockThreshold:
            data.lowStockThreshold !== undefined &&
            data.lowStockThreshold !== null
              ? data.lowStockThreshold
              : 5,

          prepTime:
            data.preparationTime !== undefined && data.preparationTime !== null
              ? data.preparationTime
              : "",

          onSale: data.isSale || false,
          specialItem: data.isSpecial || false,
          newArrival: data.isNewArrival || false,
          bestSeller: data.isBestSeller || false,
          available: data.isAvailable ?? true,

          timings: mapTimings(data.availableTimings),
          days: mapDays(data.availableDays),

          altText: data.images?.alt || "",
        }));

        // Prefer `images.url` or `thumbnail` if available
        setPreviewUrl(data.images?.url || data.thumbnail || "");
      } catch (err) {
        console.error(err);
        // router.push("/inventory");
      } finally {
        setLoadingItem(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [editId, router]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (group, item) => {
    console.log("Checkbox change:", group, item);
    const currentItems = formData[group];
    console.log("Current items before change:", currentItems);
    const newItems = currentItems.includes(item)
      ? currentItems.filter((i) => i !== item)
      : [...currentItems, item];
    handleInputChange(group, newItems);
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      setFormData((prev) => {
        if (prev.includes.includes(newTag)) return prev;
        return { ...prev, includes: [...prev.includes, newTag] };
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      includes: prev.includes.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setLoading(true);

    // // Simulate API logic
    console.log("Submitting Data:", formData);

    // setTimeout(() => {
    //   setLoading(false);
    //   alert(isEditMode ? "Item updated!" : "Item created!");
    //   router.push("/menu"); // Redirect after success
    // }, 1500);
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timingOptions = ["Breakfast", "Lunch", "Dinner", "All Day"];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4">
      <div className="max-w-[900px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {isEditMode ? "Update Menu Item" : "Add New Menu Item"}
            </h1>
            <p className="text-slate-500">
              {isEditMode
                ? `Editing: ${formData.name}`
                : "Create a new dish for your digital storefront."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? "Update Item" : "Save Item"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Masala Dosa"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Briefly describe the ingredients and taste..."
                  className="h-24"
                  required
                  maxLength={500}
                />
                <p className="text-xs text-right text-slate-400">
                  {formData.description.length}/500
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={formData.category}
                    onValueChange={(val) => handleInputChange("category", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "dosa",
                        "uttapam",
                        "chinese",
                        "thali",
                        "pav-bhaji",
                        "sweets",
                      ].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>
                    Cuisine <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={formData.cuisine}
                    onValueChange={(val) => handleInputChange("cuisine", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="south-indian">South Indian</SelectItem>
                      <SelectItem value="north-indian">North Indian</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Includes</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-slate-50/50">
                  {formData.includes.map((tag, i) => (
                    <Badge
                      key={`${tag}-${i}`}
                      variant="secondary"
                      className="gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(tag);
                        }}
                        className="ml-2"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="w-3 h-3 cursor-pointer" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
                    placeholder="Add tag (e.g. Chutney) and hit Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pricing & Marketing */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Original Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      handleInputChange("originalPrice", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Discount Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      handleInputChange("discountPrice", e.target.value)
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {["onSale", "specialItem", "newArrival", "bestSeller"].map(
                  (key) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={formData[key]}
                        onCheckedChange={(val) => handleInputChange(key, val)}
                      />
                      <Label
                        htmlFor={key}
                        className="text-sm capitalize font-normal cursor-pointer"
                      >
                        {key.replace(/([A-Z])/g, " $1")}
                      </Label>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Availability & Images */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Preparation Time (mins)</Label>
                  <Input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) =>
                      handleInputChange("prepTime", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <Label className="text-slate-500 text-xs uppercase font-bold">
                    Available Timings
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timingOptions.map((t) => {
                      return (
                        <div key={t} className="flex items-center gap-2">
                          <Checkbox
                            id={`t-${t}`}
                            checked={
                              formData.timings?.includes("All Day")
                                ? true
                                : formData.timings?.includes(t)
                            }
                            onCheckedChange={() =>
                              handleCheckboxChange("timings", t)
                            }
                          />
                          <Label
                            htmlFor={`t-${t}`}
                            className="text-sm font-normal"
                          >
                            {t}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="relative border-2 border-dashed rounded-xl aspect-video bg-slate-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <Image
                      src={`https://mrhalwai.in/${previewUrl}`}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 font-medium">
                        Click to upload image
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
                <Input
                  placeholder="Or paste Image URL"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="text-xs"
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMenuItem;

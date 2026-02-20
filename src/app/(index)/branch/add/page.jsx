"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircle2Icon, Bug } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/Map/Map"), { ssr: false });

/* -------------------- REVERSE GEOCODE -------------------- */

const CreateNewBranchPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [branchName, setBranchName] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [branchCode, setBranchCode] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState({ lat: "", lon: "" });
  const [branchRange, setBranchRange] = useState("5");
  async function getStreetName(lat, lon) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/geocode/reverse-geocode?lat=${lat}&lon=${lon}`,
      );
      const data = await res.json();
      return data.display_name;
    } catch (error) {
      return null;
    }
  }
  useEffect(() => {
    getStreetName(coords.lat, coords.lon).then((name) => {
      setAddress(name);
    });
  }, [coords]);

  /* -------------------- Submiting Data -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchName || !branchCode || !coords.lat || !coords.lon) {
      setErrorMessage(
        "Please fill in all required fields and select a location on the map.",
      );
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage("");
      }, 2000);
      return;
    }
    try {
      // Simulate API call
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shop/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: branchName,
          code: branchCode,
          shopOpen: isOpen,
          shopLocation: {
            formattedAddress: address,
            coordinates: [coords.lon, coords.lat], // Note: GeoJSON format is [longitude, latitude]
          },
        }),
      }).then((res) => {
        if (res.ok) {
          setShowSuccess(true);
          setShowError(false);
          setBranchName("");
          setBranchCode("");
          setIsOpen(true);
          setAddress("");
          setCoords({ lat: "", lon: "" });
        } else {
          setShowSuccess(false);
          setShowError(true);
        }
      });
    } catch (error) {
      setShowSuccess(false);
      setShowError(true);
    } finally {
      setTimeout(() => {
        setShowSuccess(false);
        setShowError(false);
        setErrorMessage("");
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center p-6 bg-transparent">
      {showSuccess && (
        <div className="fixed top-10 z-99999 right-10 bg-green-200 rounded-lg shadow-md p-1">
          <Alert variant="success">
            <CheckCircle2Icon />
            <AlertTitle>Branch created successfully</AlertTitle>
            <AlertDescription>
              Your branch has been created successfully.
            </AlertDescription>
          </Alert>
        </div>
      )}
      {showError && (
        <div className="fixed top-10 z-99999 right-10 bg-red-200 rounded-lg shadow-md p-1">
          <Alert variant="destructive" className="bg-transparent border-0">
            <Bug />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage || "An error occurred while creating the branch."}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Card className="relative z-10 w-full max-w-2xl rounded-2xl border bg-gradient-to-br from-white to-slate-100 shadow-[16px_16px_32px_rgba(0,0,0,0.06),-8px_-8px_16px_rgba(255,255,255,0.9)] border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Branch</CardTitle>
          <CardDescription>
            Create a branch with details and availability.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                placeholder="Enter branch name"
                onChange={(e) => setBranchName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Branch Code</Label>
              <Input
                placeholder="Enter branch code"
                onChange={(e) => setBranchCode(e.target.value)}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label>Branch Code</Label>
              <Input
                type={"number"}
                placeholder="Enter branch range"
                value={branchRange}
                onChange={(e) => setBranchRange(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label>Open Now</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle branch availability
                </p>
              </div>
              <div className="self-end">
                <Switch
                  defaultChecked
                  onChange={(e) => setIsOpen(e.target.checked)}
                />
              </div>
            </div>

            <div className="sm:col-span-2 mt-2 ">
              <Map setCoords={setCoords} />
              <Label className={"mt-4"}>Address</Label>
              <div className="flex gap-2 mt-2">
                <Textarea
                  placeholder="Branch address (optional)"
                  value={address}
                  rows={3}
                  className={"resize-none focus:outline-none focus:shadow-none"}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <div className="w-full flex gap-3">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Create Branch
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateNewBranchPage;

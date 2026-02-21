"use client";

import { useState } from "react";
import {
  Building2,
  User,
  Phone,
  Package,
  HelpCircle,
  FileText,
  Mic,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

type Step = "business" | "owner" | "products" | "faqs" | "policies" | "voice" | "review";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "business", label: "Business Info", icon: Building2 },
  { key: "owner", label: "Owner Contact", icon: User },
  { key: "products", label: "Products/Services", icon: Package },
  { key: "faqs", label: "Common Questions", icon: HelpCircle },
  { key: "policies", label: "Policies", icon: FileText },
  { key: "voice", label: "Voice & Phone", icon: Mic },
  { key: "review", label: "Review & Create", icon: CheckCircle2 },
];

interface ProductEntry {
  name: string;
  brand: string;
  price: number;
  description: string;
  category: string;
}

interface FaqEntry {
  question: string;
  answer: string;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>("business");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Business info
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [hours, setHours] = useState("");

  // Owner info
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerTelegram, setOwnerTelegram] = useState("");

  // Products
  const [products, setProducts] = useState<ProductEntry[]>([
    { name: "", brand: "", price: 0, description: "", category: "standard" },
  ]);

  // FAQs
  const [faqs, setFaqs] = useState<FaqEntry[]>([{ question: "", answer: "" }]);

  // Policies
  const [returnPolicy, setReturnPolicy] = useState("");
  const [deliveryPolicy, setDeliveryPolicy] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");

  // Voice & Phone
  const [voicePreference, setVoicePreference] = useState("male");
  const [language, setLanguage] = useState("english");
  const [greeting, setGreeting] = useState("");
  const [transferTriggers, setTransferTriggers] = useState(
    "complaints, returns, wholesale, speak to owner"
  );
  const [phoneOption, setPhoneOption] = useState("new_number");
  const [plan, setPlan] = useState("starter");

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].key);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].key);
    }
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { name: "", brand: "", price: 0, description: "", category: "standard" },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductEntry, value: string | number) => {
    const updated = [...products];
    (updated[index] as any)[field] = value;
    setProducts(updated);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: keyof FaqEntry, value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          industry,
          address,
          phone,
          website,
          hours,
          ownerName,
          ownerEmail,
          ownerPhone,
          ownerTelegram,
          voicePreference,
          language,
          greeting,
          transferTriggers: transferTriggers.split(",").map((t) => t.trim()),
          products: products.filter((p) => p.name),
          faqs: faqs.filter((f) => f.question),
          policies: { returnPolicy, deliveryPolicy, paymentMethods },
          plan,
          phoneOption,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create business");

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-zinc-900 border border-emerald-800 rounded-xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Business Created!</h2>
          <p className="text-zinc-400 mb-6">
            <strong>{result.business.name}</strong> has been set up successfully.
          </p>

          <div className="bg-zinc-800 rounded-lg p-4 text-left space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-zinc-300">Owner Login Credentials</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-zinc-500">Email:</span>
              <span className="text-white font-mono">{result.user.email}</span>
              <span className="text-zinc-500">Temp Password:</span>
              <span className="text-white font-mono">{result.user.tempPassword}</span>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4 text-left space-y-2 mb-6">
            <h3 className="text-sm font-semibold text-zinc-300">Next Steps</h3>
            <ol className="text-sm text-zinc-400 list-decimal list-inside space-y-1">
              <li>Configure ElevenLabs agent with knowledge base</li>
              <li>Set up phone number ({result.nextSteps.phoneOption === "new_number" ? "buy new Twilio number" : "client forwards existing number"})</li>
              <li>Make 5-10 test calls</li>
              <li>Share login credentials with the business owner</li>
              <li>Go live!</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-center">
            <a
              href="/businesses"
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              View All Businesses
            </a>
            <button
              onClick={() => {
                setResult(null);
                setCurrentStep("business");
                setBusinessName("");
                setOwnerName("");
                setOwnerEmail("");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Add Another Business
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Client Onboarding</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Set up a new business client with their AI voice agent
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const isActive = step.key === currentStep;
          const isDone = i < stepIndex;
          return (
            <button
              key={step.key}
              onClick={() => setCurrentStep(step.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  : isDone
                    ? "bg-emerald-600/10 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <step.icon className="w-3.5 h-3.5" />
              {step.label}
            </button>
          );
        })}
      </div>

      {/* Form content */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {currentStep === "business" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Business Name *" value={businessName} onChange={setBusinessName} placeholder="Edwards Cigar Shop" />
              <Field label="Industry" value={industry} onChange={setIndustry} placeholder="retail, restaurant, salon..." />
              <Field label="Address" value={address} onChange={setAddress} placeholder="123 Main St, City, State" />
              <Field label="Business Phone" value={phone} onChange={setPhone} placeholder="+1 555-123-4567" />
              <Field label="Website" value={website} onChange={setWebsite} placeholder="https://example.com" />
              <Field label="Business Hours" value={hours} onChange={setHours} placeholder="Mon-Fri 10-22, Sat-Sun 12-20" />
            </div>
          </div>
        )}

        {currentStep === "owner" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Owner Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Owner Name *" value={ownerName} onChange={setOwnerName} placeholder="John Edwards" />
              <Field label="Owner Email *" value={ownerEmail} onChange={setOwnerEmail} placeholder="john@example.com" type="email" />
              <Field label="Owner Phone (for transfers)" value={ownerPhone} onChange={setOwnerPhone} placeholder="+1 555-987-6543" />
              <Field label="Telegram Chat ID (for alerts)" value={ownerTelegram} onChange={setOwnerTelegram} placeholder="5273526040" />
            </div>
          </div>
        )}

        {currentStep === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Products / Services
              </h2>
              <button
                onClick={addProduct}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>
            <p className="text-sm text-zinc-500">
              Add the products or services your client offers. The AI agent will use this to answer customer questions.
            </p>
            {products.map((product, i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Product {i + 1}</span>
                  {products.length > 1 && (
                    <button onClick={() => removeProduct(i)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Name" value={product.name} onChange={(v) => updateProduct(i, "name", v)} placeholder="Product name" />
                  <Field label="Brand" value={product.brand} onChange={(v) => updateProduct(i, "brand", v)} placeholder="Brand name" />
                  <Field label="Price" value={String(product.price || "")} onChange={(v) => updateProduct(i, "price", parseFloat(v) || 0)} placeholder="0.00" type="number" />
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <select
                      value={product.category}
                      onChange={(e) => updateProduct(i, "category", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                </div>
                <Field label="Description" value={product.description} onChange={(v) => updateProduct(i, "description", v)} placeholder="Brief description..." />
              </div>
            ))}
          </div>
        )}

        {currentStep === "faqs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                Common Questions
              </h2>
              <button
                onClick={addFaq}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            <p className="text-sm text-zinc-500">
              What do customers always ask on the phone? Add the top questions and answers.
            </p>
            {faqs.map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Q{i + 1}</span>
                  {faqs.length > 1 && (
                    <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Field label="Question" value={faq.question} onChange={(v) => updateFaq(i, "question", v)} placeholder="What are your hours?" />
                <Field label="Answer" value={faq.answer} onChange={(v) => updateFaq(i, "answer", v)} placeholder="We're open Mon-Fri 10am-10pm..." />
              </div>
            ))}
          </div>
        )}

        {currentStep === "policies" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Business Policies
            </h2>
            <Field label="Return/Refund Policy" value={returnPolicy} onChange={setReturnPolicy} placeholder="30-day returns with receipt..." textarea />
            <Field label="Delivery/Shipping Policy" value={deliveryPolicy} onChange={setDeliveryPolicy} placeholder="Free delivery over $50, otherwise $5 flat rate..." textarea />
            <Field label="Payment Methods" value={paymentMethods} onChange={setPaymentMethods} placeholder="Cash, Visa, Mastercard, Apple Pay..." />
          </div>
        )}

        {currentStep === "voice" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-400" />
              Voice Agent & Phone Setup
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Voice Preference</label>
                <select
                  value={voicePreference}
                  onChange={(e) => setVoicePreference(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="male">Male (Professional)</option>
                  <option value="female">Female (Professional)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="english">English</option>
                  <option value="russian">Russian</option>
                  <option value="spanish">Spanish</option>
                </select>
              </div>
            </div>

            <Field
              label="Agent Greeting"
              value={greeting}
              onChange={setGreeting}
              placeholder={`Hello! You've reached ${businessName || "the business"}. I'm the AI assistant. How can I help you today?`}
              textarea
            />

            <Field
              label="Transfer Triggers (comma-separated)"
              value={transferTriggers}
              onChange={setTransferTriggers}
              placeholder="complaints, returns, wholesale, speak to owner"
            />

            <div>
              <label className="block text-xs text-zinc-400 mb-2">Phone Number Setup</label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600">
                  <input
                    type="radio"
                    value="new_number"
                    checked={phoneOption === "new_number"}
                    onChange={(e) => setPhoneOption(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-white font-medium">New dedicated number ($1/mo)</p>
                    <p className="text-xs text-zinc-500">Buy a new Twilio number. Client can advertise it or forward their existing number to it.</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600">
                  <input
                    type="radio"
                    value="forward_existing"
                    checked={phoneOption === "forward_existing"}
                    onChange={(e) => setPhoneOption(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-white font-medium">Forward existing number</p>
                    <p className="text-xs text-zinc-500">Client sets up call forwarding from their carrier. Customers keep calling the same number.</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="starter">Starter — $1,497/mo</option>
                <option value="growth">Growth — $2,497/mo</option>
                <option value="enterprise">Enterprise — $3,997/mo</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === "review" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              Review & Create
            </h2>

            <div className="space-y-3">
              <ReviewSection title="Business" items={[
                ["Name", businessName],
                ["Industry", industry],
                ["Phone", phone],
                ["Address", address],
              ]} />
              <ReviewSection title="Owner" items={[
                ["Name", ownerName],
                ["Email", ownerEmail],
                ["Phone", ownerPhone],
                ["Telegram", ownerTelegram],
              ]} />
              <ReviewSection title="Products" items={
                products.filter(p => p.name).map(p => [p.name, `$${p.price} — ${p.category}`])
              } />
              <ReviewSection title="FAQs" items={
                faqs.filter(f => f.question).map(f => [f.question, f.answer.slice(0, 60) + (f.answer.length > 60 ? "..." : "")])
              } />
              <ReviewSection title="Agent" items={[
                ["Voice", voicePreference],
                ["Language", language],
                ["Phone Option", phoneOption === "new_number" ? "New number" : "Forward existing"],
                ["Plan", plan],
              ]} />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {currentStep === "review" ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !businessName || !ownerEmail || !ownerName}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 disabled:opacity-40 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Create Business <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  const className =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none";

  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={className + " resize-none"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}

function ReviewSection({ title, items }: { title: string; items: [string, string][] }) {
  const filtered = items.filter(([, v]) => v);
  if (filtered.length === 0) return null;

  return (
    <div className="bg-zinc-800 rounded-lg p-3">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase mb-2">{title}</h3>
      <div className="space-y-1">
        {filtered.map(([key, val], i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-zinc-500">{key}</span>
            <span className="text-white">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

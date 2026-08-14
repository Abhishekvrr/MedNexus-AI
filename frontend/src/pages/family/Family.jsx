import { useEffect, useState } from "react";
import {
  Users,
  UserRound,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  Heart,
  Plus,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

function Family() {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view your family members.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/family`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load family members."
        );
      }

      setFamilyMembers(
        data.family_members || []
      );
    } catch (err) {
      console.error(
        "Family members error:",
        err
      );

      setError(
        err.message ||
          "Unable to load family members."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard-content">

      <div className="welcome-row">
        <div>
          <span className="dashboard-eyebrow">
            Care Network
          </span>

          <h1>Family</h1>

          <p>
            Manage the people connected to your
            healthcare profile.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={loadFamilyMembers}
          disabled={loading}
          style={{
            background: "#eff6ff",
            color: "#2563eb",
            border: "1px solid #dbeafe",
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            marginTop: "24px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div
          className="dashboard-card"
          style={{
            marginTop: "24px",
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <RefreshCw
            size={28}
            style={{
              color: "#2563eb",
              animation:
                "mednexus-family-spin 1s linear infinite",
            }}
          />

          <p
            className="card-muted"
            style={{
              marginTop: "12px",
            }}
          >
            Loading family members...
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        familyMembers.length === 0 && (
          <div
            className="dashboard-card"
            style={{
              marginTop: "24px",
              padding: "55px 20px",
              textAlign: "center",
            }}
          >
            <div
              className="card-icon blue"
              style={{
                margin: "0 auto",
              }}
            >
              <Users size={25} />
            </div>

            <h3
              style={{
                marginTop: "16px",
              }}
            >
              No family members added
            </h3>

            <p
              className="card-muted"
              style={{
                marginTop: "7px",
              }}
            >
              Family members and emergency contacts
              will appear here.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        familyMembers.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "28px",
                marginBottom: "14px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "#1e293b",
                  }}
                >
                  Connected People
                </h2>

                <p
                  className="card-muted"
                  style={{
                    marginTop: "4px",
                  }}
                >
                  {familyMembers.length}{" "}
                  {familyMembers.length === 1
                    ? "person"
                    : "people"}{" "}
                  connected
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                <Heart size={14} />
                Care Support
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "15px",
              }}
            >
              {familyMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                />
              ))}
            </div>
          </>
        )}

      <style>
        {`
          @keyframes mednexus-family-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </section>
  );
}

function FamilyMemberCard({ member }) {
  const name =
    member.name ||
    member.full_name ||
    "Family Member";

  const relationship =
    member.relationship ||
    member.relation ||
    "Family";

  const phone =
    member.phone ||
    member.phone_number ||
    "";

  const email =
    member.email ||
    "";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className="dashboard-card">

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: "#eff6ff",
            color: "#2563eb",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {initials || (
            <UserRound size={21} />
          )}
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
            }}
          >
            {name}
          </h3>

          <span
            style={{
              display: "inline-flex",
              marginTop: "6px",
              padding: "4px 8px",
              borderRadius: "999px",
              background: "#f1f5f9",
              color: "#64748b",
              fontSize: "10px",
              fontWeight: 700,
            }}
          >
            {relationship}
          </span>
        </div>
      </div>

      {(phone || email) && (
        <div
          style={{
            marginTop: "18px",
            paddingTop: "15px",
            borderTop: "1px solid #f1f5f9",
            display: "grid",
            gap: "11px",
          }}
        >
          {phone && (
            <ContactItem
              icon={<Phone size={15} />}
              label="Phone"
              value={phone}
            />
          )}

          {email && (
            <ContactItem
              icon={<Mail size={15} />}
              label="Email"
              value={email}
            />
          )}
        </div>
      )}

      {!phone && !email && (
        <p
          className="card-muted"
          style={{
            marginTop: "18px",
            paddingTop: "15px",
            borderTop: "1px solid #f1f5f9",
            fontSize: "11px",
          }}
        >
          No contact details available.
        </p>
      )}

    </article>
  );
}

function ContactItem({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
      }}
    >
      <span
        style={{
          display: "flex",
          color: "#2563eb",
        }}
      >
        {icon}
      </span>

      <div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "2px",
            color: "#475569",
            fontSize: "12px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default Family;
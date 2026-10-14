// Mock dataset (SIMULATED demo data) bound to a global variable.
window.MOCK_DATASET = {
  "scenarios": [
    {
      "scenarioId": "SCENARIO-A",
      "type": "LED_STREET_LIGHT",
      "language": "en",
      "description": "Standard English street light procurement with outdated standard reference and missing test methods."
    },
    {
      "scenarioId": "SCENARIO-B",
      "type": "LED_BULB",
      "language": "hi",
      "description": "Hindi language LED bulb procurement demonstrating multilingual capability."
    },
    {
      "scenarioId": "SCENARIO-C",
      "type": "LED_FLOOD_LIGHT",
      "language": "en",
      "description": "Flood light tender with restrictive specs and tender-standard mismatches."
    }
  ],
  "tender-profiles": [
    {
      "scenarioId": "SCENARIO-A",
      "title": "Procurement of LED Road/Street Lighting",
      "tenderNumber": "TND-2026-A-001",
      "language": "en",
      "department": "ETD",
      "productFamily": "Lighting",
      "product": "LED Street Light",
      "application": "Outdoor Roadway",
      "summary": "Supply of 90W LED street lights for municipal roads with IP66 rating.",
      "sourceFile": "tender-A-led-street-light-en.pdf",
      "fingerprint": "SIM/ETD/2026/001",
      "extractionMode": "SIMULATED",
      "requirements": [
        "REQ-A-1",
        "REQ-A-2",
        "REQ-A-3"
      ],
      "certificationRequirements": [
        "CERT-A-1"
      ],
      "riskProfile": [
        "RISK-A-1",
        "RISK-A-2"
      ]
    },
    {
      "scenarioId": "SCENARIO-B",
      "title": "९ वाट एलईडी बल्ब की आपूर्ति (Supply of 9W LED Bulbs)",
      "tenderNumber": "TND-2026-B-002",
      "language": "hi",
      "department": "ETD",
      "productFamily": "Lighting",
      "product": "LED Bulb",
      "application": "Indoor Residential",
      "summary": "Government building 9W LED bulb replacement.",
      "sourceFile": "tender-B-led-bulb-hi.pdf",
      "fingerprint": "SIM/ETD/2026/002",
      "extractionMode": "SIMULATED",
      "requirements": [
        "REQ-B-1",
        "REQ-B-2"
      ],
      "certificationRequirements": [],
      "riskProfile": []
    },
    {
      "scenarioId": "SCENARIO-C",
      "title": "High Mast LED Flood Lighting",
      "tenderNumber": "TND-2026-C-003",
      "language": "en",
      "department": "ETD",
      "productFamily": "Lighting",
      "product": "LED Flood Light",
      "application": "Outdoor Stadium",
      "summary": "200W LED Flood lights for sports stadium.",
      "sourceFile": "tender-C-led-flood-light-en.pdf",
      "fingerprint": "SIM/ETD/2026/003",
      "extractionMode": "SIMULATED",
      "requirements": [
        "REQ-C-1",
        "REQ-C-2",
        "REQ-C-3"
      ],
      "certificationRequirements": [],
      "riskProfile": [
        "RISK-C-1",
        "RISK-C-2"
      ]
    }
  ],
  "requirements": [
    {
      "requirementId": "REQ-A-1",
      "category": "Performance",
      "field": "rated power",
      "value": "90",
      "unit": "W",
      "operator": "APPROX",
      "sourceText": "approximately 90W",
      "sourceSpan": "Page 2, Line 15",
      "confidence": "High",
      "editable": true,
      "evidenceIds": [
        "EV-A-1"
      ]
    },
    {
      "requirementId": "REQ-A-2",
      "category": "Performance",
      "field": "ingress protection",
      "value": "IP66",
      "unit": "",
      "operator": "EQ",
      "sourceText": "IP66 requirement",
      "sourceSpan": "Page 2, Line 18",
      "confidence": "High",
      "editable": true,
      "evidenceIds": []
    },
    {
      "requirementId": "REQ-A-3",
      "category": "Safety",
      "field": "standard reference",
      "value": "IS 10322 Part 5 Sec 3 2012",
      "unit": "",
      "operator": "EQ",
      "sourceText": "As per IS 10322 (Part 5/Sec 3): 2012",
      "sourceSpan": "Page 3, Line 4",
      "confidence": "High",
      "editable": true,
      "evidenceIds": [
        "EV-A-2"
      ]
    },
    {
      "requirementId": "REQ-B-1",
      "category": "Performance",
      "field": "rated power",
      "value": "9",
      "unit": "W",
      "operator": "EQ",
      "sourceText": "९ वाट (9 Watts)",
      "sourceSpan": "Page 1, Line 5",
      "confidence": "High",
      "editable": true,
      "evidenceIds": []
    },
    {
      "requirementId": "REQ-B-2",
      "category": "Product",
      "field": "product type",
      "value": "LED bulb",
      "unit": "",
      "operator": "EQ",
      "sourceText": "एलईडी बल्ब (LED Bulb)",
      "sourceSpan": "Page 1, Line 5",
      "confidence": "High",
      "editable": true,
      "evidenceIds": []
    },
    {
      "requirementId": "REQ-C-1",
      "category": "Product",
      "field": "brand",
      "value": "SpecificBrand",
      "unit": "",
      "operator": "EQ",
      "sourceText": "Only SpecificBrand acceptable",
      "sourceSpan": "Page 4, Line 12",
      "confidence": "High",
      "editable": true,
      "evidenceIds": [
        "EV-C-1"
      ]
    },
    {
      "requirementId": "REQ-C-2",
      "category": "Performance",
      "field": "power factor",
      "value": "0.5",
      "unit": "",
      "operator": "EQ",
      "sourceText": "Power factor 0.5",
      "sourceSpan": "Page 4, Line 15",
      "confidence": "Medium",
      "editable": true,
      "evidenceIds": []
    },
    {
      "requirementId": "REQ-C-3",
      "category": "Performance",
      "field": "surge protection",
      "value": "10",
      "unit": "kV",
      "operator": "GTE",
      "sourceText": "10kV surge protection",
      "sourceSpan": "Page 4, Line 18",
      "confidence": "High",
      "editable": true,
      "evidenceIds": [
        "EV-C-2"
      ]
    }
  ],
  "standards": [
    {
      "id": "IS-10322-5-3",
      "isNumber": "IS 10322 (Part 5/Sec 3)",
      "title": "Luminaires - Part 5: Particular Requirements - Sec 3: Luminaires for Road and Street Lighting",
      "type": "PRIMARY",
      "department": "ETD",
      "committee": "Illumination Engineering",
      "scopeSummary": "Specifies requirements for luminaires for road, street lighting and other outdoor public lighting applications.",
      "status": "SIMULATED_CURRENT",
      "latestRevision": "2014",
      "revisions": [
        "2012",
        "2014"
      ],
      "amendments": [
        "Amd 1 (2018)"
      ],
      "supersededBy": null,
      "specConstraints": [],
      "sourceName": "BIS",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "verification": "SIMULATED",
      "verified": false
    },
    {
      "id": "IS-16107-1",
      "isNumber": "IS 16107 (Part 1)",
      "title": "LED Luminaires for General Lighting Purposes - Part 1: Safety Requirements",
      "type": "SAFETY",
      "department": "ETD",
      "committee": "Illumination",
      "scopeSummary": "Safety requirements for LED luminaires.",
      "status": "SIMULATED_CURRENT",
      "latestRevision": "2012",
      "revisions": [
        "2012"
      ],
      "amendments": [],
      "supersededBy": null,
      "specConstraints": [],
      "sourceName": "BIS",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "verification": "SIMULATED",
      "verified": false
    },
    {
      "id": "IS-IEC-60529",
      "isNumber": "IS/IEC 60529",
      "title": "Degrees of Protection Provided by Enclosures (IP Code)",
      "type": "TEST",
      "department": "ETD",
      "committee": "Electrotechnical",
      "scopeSummary": "Classification of degrees of protection provided by enclosures.",
      "status": "SIMULATED_CURRENT",
      "latestRevision": "2001",
      "revisions": [
        "2001"
      ],
      "amendments": [],
      "supersededBy": null,
      "specConstraints": [],
      "sourceName": "BIS",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "verification": "SIMULATED",
      "verified": false
    },
    {
      "id": "IS-16102-1",
      "isNumber": "IS 16102 (Part 1)",
      "title": "Self-Ballasted LED Lamps for General Lighting Services - Part 1: Safety Requirements",
      "type": "PRIMARY",
      "department": "ETD",
      "committee": "Illumination",
      "scopeSummary": "Safety requirements for self-ballasted LED lamps.",
      "status": "SIMULATED_CURRENT",
      "latestRevision": "2012",
      "revisions": [
        "2012"
      ],
      "amendments": [],
      "supersededBy": null,
      "specConstraints": [],
      "sourceName": "BIS",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "verification": "SIMULATED",
      "verified": false
    },
    {
      "id": "IS-10322-5-5",
      "isNumber": "IS 10322 (Part 5/Sec 5)",
      "title": "Luminaires - Part 5: Particular Requirements - Sec 5: Floodlights",
      "type": "PRIMARY",
      "department": "ETD",
      "committee": "Illumination",
      "scopeSummary": "Requirements for floodlights.",
      "status": "SIMULATED_CURRENT",
      "latestRevision": "2013",
      "revisions": [
        "2013"
      ],
      "amendments": [],
      "supersededBy": null,
      "specConstraints": [
        {
          "field": "power factor",
          "min": 0.9
        }
      ],
      "sourceName": "BIS",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "verification": "SIMULATED",
      "verified": false
    }
  ],
  "standard-edges": [
    {
      "edgeId": "EDG-1",
      "from": "IS-10322-5-3",
      "to": "IS-16107-1",
      "type": "REFERENCES",
      "label": "Requires Safety Compliance",
      "evidenceIds": []
    },
    {
      "edgeId": "EDG-2",
      "from": "IS-10322-5-3",
      "to": "IS-IEC-60529",
      "type": "TEST_METHOD_FOR",
      "label": "IP Testing Method",
      "evidenceIds": []
    },
    {
      "edgeId": "EDG-3",
      "from": "IS-10322-5-5",
      "to": "IS-IEC-60529",
      "type": "TEST_METHOD_FOR",
      "label": "IP Testing Method",
      "evidenceIds": []
    }
  ],
  "recommendations": [
    {
      "recommendationId": "REC-A-1",
      "scenarioId": "SCENARIO-A",
      "standardId": "IS-10322-5-3",
      "role": "PRIMARY",
      "confidenceBand": "High",
      "whyRecommended": "Recommended because the tender describes an outdoor LED road-lighting product and specifies ingress protection and photometric performance requirements covered by this standard.",
      "requirementMatches": [
        {
          "requirementId": "REQ-A-3",
          "status": "Outdated",
          "explanation": "Tender cites 2012 version, but 2014 is latest.",
          "evidenceIds": [
            "EV-A-2"
          ]
        }
      ],
      "signals": {
        "keyword": "High",
        "semantic": "High",
        "isNumber": "High",
        "graphLink": "None",
        "category": "High"
      },
      "consideredButNotChosen": false,
      "evidenceIds": [
        "EV-A-2"
      ],
      "riskFlagIds": [
        "RISK-A-1"
      ]
    },
    {
      "recommendationId": "REC-A-2",
      "scenarioId": "SCENARIO-A",
      "standardId": "IS-IEC-60529",
      "role": "TEST",
      "confidenceBand": "High",
      "whyRecommended": "Standard test method for IP66 requirement specified in the tender.",
      "requirementMatches": [
        {
          "requirementId": "REQ-A-2",
          "status": "Match",
          "explanation": "Covers ingress protection testing.",
          "evidenceIds": []
        }
      ],
      "signals": {
        "keyword": "Medium",
        "semantic": "High",
        "isNumber": "None",
        "graphLink": "High",
        "category": "High"
      },
      "consideredButNotChosen": false,
      "evidenceIds": [],
      "riskFlagIds": [
        "RISK-A-2"
      ]
    },
    {
      "recommendationId": "REC-B-1",
      "scenarioId": "SCENARIO-B",
      "standardId": "IS-16102-1",
      "role": "PRIMARY",
      "confidenceBand": "High",
      "whyRecommended": "Primary safety standard for self-ballasted LED lamps matching the 9W bulb requirement.",
      "requirementMatches": [
        {
          "requirementId": "REQ-B-1",
          "status": "Match",
          "explanation": "Covers standard wattage ratings.",
          "evidenceIds": []
        },
        {
          "requirementId": "REQ-B-2",
          "status": "Match",
          "explanation": "Applies directly to LED bulbs.",
          "evidenceIds": []
        }
      ],
      "signals": {
        "keyword": "None",
        "semantic": "High",
        "isNumber": "None",
        "graphLink": "None",
        "category": "High"
      },
      "consideredButNotChosen": false,
      "evidenceIds": [],
      "riskFlagIds": []
    },
    {
      "recommendationId": "REC-C-1",
      "scenarioId": "SCENARIO-C",
      "standardId": "IS-10322-5-5",
      "role": "PRIMARY",
      "confidenceBand": "High",
      "whyRecommended": "Primary specification for floodlights.",
      "requirementMatches": [
        {
          "requirementId": "REQ-C-2",
          "status": "Conflict",
          "explanation": "Standard requires minimum PF 0.9, tender specifies 0.5.",
          "evidenceIds": []
        }
      ],
      "signals": {
        "keyword": "High",
        "semantic": "High",
        "isNumber": "None",
        "graphLink": "None",
        "category": "High"
      },
      "consideredButNotChosen": false,
      "evidenceIds": [
        "EV-C-2"
      ],
      "riskFlagIds": [
        "RISK-C-1",
        "RISK-C-2"
      ]
    }
  ],
  "evidence": [
    {
      "evidenceId": "EV-A-1",
      "claim": "Requirement extracted from text.",
      "standardId": null,
      "sourceName": "Tender Document",
      "sourceType": "Demo fixture",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "status": "Verified (Fresh)",
      "simulated": true,
      "snippet": "...consisting of approximately 90W LED fixtures...",
      "fieldsSupported": [
        "rated power"
      ]
    },
    {
      "evidenceId": "EV-A-2",
      "claim": "Latest revision is 2014.",
      "standardId": "IS-10322-5-3",
      "sourceName": "BIS",
      "sourceType": "Simulated source",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "status": "Verified (Cached, dated)",
      "simulated": true,
      "snippet": "[SIMULATED] IS 10322 (Part 5/Sec 3) Edition 2014 supersedes Edition 2012.",
      "fieldsSupported": [
        "latestRevision"
      ]
    },
    {
      "evidenceId": "EV-C-1",
      "claim": "Brand constraint found in text.",
      "standardId": null,
      "sourceName": "Tender Document",
      "sourceType": "Demo fixture",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "status": "Verified (Fresh)",
      "simulated": true,
      "snippet": "...Only SpecificBrand acceptable for flood lights...",
      "fieldsSupported": [
        "brand"
      ]
    },
    {
      "evidenceId": "EV-C-2",
      "claim": "Unclear decision evidence regarding surge protection.",
      "standardId": "IS-10322-5-5",
      "sourceName": "BIS",
      "sourceType": "Simulated source",
      "sourceUrl": null,
      "checkedAt": "2026-10-05",
      "status": "Unverified",
      "simulated": true,
      "snippet": "[SIMULATED] Surge protection requirements are undefined in base standard.",
      "fieldsSupported": [
        "surge protection"
      ]
    }
  ],
  "decisions": [
    {
      "decisionId": "DEC-A-1",
      "scenarioId": "SCENARIO-A",
      "standardId": "IS-10322-5-3",
      "status": "PENDING",
      "reason": "",
      "actor": "PROCUREMENT_OFFICER",
      "timestamp": "2026-10-05T10:00:00Z"
    },
    {
      "decisionId": "DEC-C-1",
      "scenarioId": "SCENARIO-C",
      "standardId": "IS-10322-5-5",
      "status": "REJECTED",
      "reason": "Requires higher power factor, will amend tender.",
      "actor": "PROCUREMENT_OFFICER",
      "timestamp": "2026-10-05T10:05:00Z"
    }
  ],
  "audit-events": [
    {
      "id": "AUD-1",
      "timestamp": "2026-10-05T09:50:00Z",
      "actor": "SYSTEM",
      "event": "TENDER_UPLOADED",
      "target": "TND-2026-A-001",
      "detail": "PDF uploaded and parsed."
    },
    {
      "id": "AUD-2",
      "timestamp": "2026-10-05T09:51:00Z",
      "actor": "SYSTEM",
      "event": "REQUIREMENTS_EXTRACTED",
      "target": "TND-2026-A-001",
      "detail": "Extracted 3 requirements."
    }
  ],
  "certifications": [
    {
      "certificationId": "CERT-A-1",
      "productCategory": "LED Luminaires",
      "scheme": "CRS (Compulsory Registration Scheme)",
      "status": "Applicable",
      "reason": "LED street lights fall under mandatory BIS CRS.",
      "evidenceIds": [],
      "verification": "SIMULATED"
    }
  ],
  "risk-flags": [
    {
      "riskId": "RISK-A-1",
      "scenarioId": "SCENARIO-A",
      "type": "OUTDATED_STANDARD",
      "severity": "Orange",
      "title": "Outdated Standard Reference",
      "message": "Tender references IS 10322 (Part 5/Sec 3): 2012, but the latest simulated revision is 2014.",
      "triggerRequirementIds": [
        "REQ-A-3"
      ],
      "standardIds": [
        "IS-10322-5-3"
      ],
      "evidenceIds": [
        "EV-A-2"
      ],
      "blocksDecision": false,
      "requiresOfficerReview": true
    },
    {
      "riskId": "RISK-A-2",
      "scenarioId": "SCENARIO-A",
      "type": "MISSING_TEST_REFERENCE",
      "severity": "Yellow",
      "title": "Missing IP Test Reference",
      "message": "Tender specifies IP66 but does not cite the normative testing standard IS/IEC 60529.",
      "triggerRequirementIds": [
        "REQ-A-2"
      ],
      "standardIds": [
        "IS-IEC-60529"
      ],
      "evidenceIds": [],
      "blocksDecision": false,
      "requiresOfficerReview": true
    },
    {
      "riskId": "RISK-C-1",
      "scenarioId": "SCENARIO-C",
      "type": "POTENTIALLY_RESTRICTIVE_SPECIFICATION",
      "severity": "Red",
      "title": "Restrictive Brand Specification",
      "message": "Potential risk — officer review required. Tender specifies a single brand.",
      "triggerRequirementIds": [
        "REQ-C-1"
      ],
      "standardIds": [],
      "evidenceIds": [
        "EV-C-1"
      ],
      "blocksDecision": false,
      "requiresOfficerReview": true
    },
    {
      "riskId": "RISK-C-2",
      "scenarioId": "SCENARIO-C",
      "type": "TENDER_STANDARD_MISMATCH",
      "severity": "Orange",
      "title": "Standard Mismatch (Power Factor)",
      "message": "Tender specifies PF 0.5, but IS 10322 (Part 5/Sec 5) requires minimum 0.9.",
      "triggerRequirementIds": [
        "REQ-C-2"
      ],
      "standardIds": [
        "IS-10322-5-5"
      ],
      "evidenceIds": [],
      "blocksDecision": false,
      "requiresOfficerReview": true
    }
  ],
  "translations": [
    {
      "language": "hi",
      "originalText": "९ वाट एलईडी बल्ब की आवश्यकता",
      "englishTranslation": "Requirement of 9W LED bulb",
      "translationStatus": "SIMULATED"
    }
  ]
};

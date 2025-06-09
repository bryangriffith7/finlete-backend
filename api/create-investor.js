export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const dealId = "3827263";

    const ACCESS_TOKEN = process.env.DEALMAKER_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
        return res.status(500).json({ error: "Missing DealMaker access token" });
    }

    const {
        first_name,
        last_name,
        email,
        phone,
        allocated_amount,
        accredited_investor,
        annual_income,
        net_worth,
        investor_type,
        address
    } = req.body;

    if (
        !first_name || !last_name || !email || !phone || !allocated_amount ||
        !investor_type || !address || !address.line1 || !address.city || !address.state
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const endpoint = `https://api.dealmaker.tech/api/v1/deals/${dealId}/investor_profiles/${investor_type}`;

    const payload = {
        first_name,
        last_name,
        email,
        phone,
        allocated_amount,
        accredited_investor,
        ...(accredited_investor === false || accredited_investor === "not sure"
            ? { annual_income, net_worth }
            : {}),
        address
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("DealMaker API Error:", data);
            return res.status(response.status).json({ error: data });
        }

        return res.status(200).json({
            access_link: data.access_link,
            investor_id: data.id
        });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
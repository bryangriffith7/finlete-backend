export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 🔧 Manually set the dealId here (update for each new offering)
    const dealId = "3827263";

    const {
        first_name,
        last_name,
        email,
        phone,
        allocated_amount,
        accredited_investor,
        annual_income,
        net_worth,
        investor_type, // individual, joint, etc.
        address, // { line1, city, state, postal_code, country }
    } = req.body;

    // Basic server-side validation
    if (!first_name || !last_name || !email || !phone || !allocated_amount || !investor_type || !address) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const endpoint = `https://api.dealmaker.tech/api/v1/deals/${dealId}/investor_profiles/${investor_type}`;
    const ACCESS_TOKEN = process.env.DEALMAKER_ACCESS_TOKEN;

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
        address,
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("DealMaker API Error:", data);
            return res.status(response.status).json({ error: data });
        }

        // Successful response
        return res.status(200).json({
            access_link: data.access_link,
            investor_id: data.id,
        });
    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
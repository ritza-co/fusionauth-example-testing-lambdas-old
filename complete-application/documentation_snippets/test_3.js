async function populate(jwt, user, registration) {
  const response = await fetch("https://issanctioned.example.com/api/banned?email=" + encodeURIComponent(user.email), {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (response.status === 200) {
    const jsonResponse = await response.json();
    jwt.isBanned = jsonResponse.isBanned;
  }
  else
    jwt.isBanned = false;
}
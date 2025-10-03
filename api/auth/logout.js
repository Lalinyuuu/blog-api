export async function logout(req, res) {
    // JWT stateless - logout handled on client side
    // Could add token blacklist here if needed
    res.json({ message: 'Logged out successfully' });
  }
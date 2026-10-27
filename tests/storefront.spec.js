import { test as base, expect } from "@playwright/test";

const test = base.extend({
    page: async ({ page }, runPageFixture) => {
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await runPageFixture(page);
        expect(errors, "The storefront should not throw browser errors").toEqual([]);
    },
});

async function addHeadphones(page) {
    await page.goto("/products/1");
    await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
    await expect(page.getByRole("button", { name: "Add to Cart (1)", exact: true })).toBeVisible();
}

async function fillAccount(page, email = "recruiter@example.com", password = "demo123") {
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
}

test("catalogue and details share the selected product", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".product-card")).toHaveCount(8);
    await page.locator(".product-card").filter({ hasText: "Wireless Headphones" })
        .getByRole("link", { name: "View Details" }).click();
    await expect(page).toHaveURL(/\/products\/1$/);
    await expect(page.getByRole("heading", { name: "Wireless Headphones" })).toBeVisible();
    await expect(page.locator(".product-detail-price")).toHaveText("$99.99");
});

test("navbar login and signup switches work while already on the auth route", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Login", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();
    await fillAccount(page);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Invalid email or password");
    await page.getByRole("link", { name: "Signup", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sign Up", exact: true })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await page.getByRole("link", { name: "Login", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();
});

test("auth switches support the keyboard and clear stale errors", async ({ page }) => {
    await page.goto("/auth");
    await fillAccount(page, "recruiter@example.com", "short");
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("at least 6");
    const loginSwitch = page.locator(".auth-switch").getByRole("button", { name: "Login", exact: true });
    await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Sign Up", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(loginSwitch).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
});

test("signup, session refresh, logout, duplicate account and login validation", async ({ page }) => {
    await page.goto("/auth");
    await fillAccount(page, "Recruiter@example.com");
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();
    await expect(page.locator(".navbar-greeting")).toContainText("recruiter@example.com");
    await page.reload();
    await expect(page.locator(".navbar-greeting")).toContainText("recruiter@example.com");
    await page.getByRole("button", { name: "Logout" }).click();
    await page.getByRole("link", { name: "Signup", exact: true }).click();
    await fillAccount(page, "RECRUITER@example.com");
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Email already exists");
    await page.locator(".auth-switch").getByRole("button", { name: "Login", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();
    await fillAccount(page, "RECRUITER@example.com", "wrong123");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Invalid email or password");
    await fillAccount(page, "RECRUITER@example.com");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page.locator(".navbar-greeting")).toContainText("recruiter@example.com");
});

test("cart quantities, totals, refresh, decrement to zero and removal", async ({ page }) => {
    await addHeadphones(page);
    await page.getByRole("button", { name: "Add to Cart (1)", exact: true }).click();
    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await expect(page.locator(".quantity-value")).toHaveText("2");
    await expect(page.locator(".checkout-total-final")).toHaveText("$199.98");
    await page.getByRole("button", { name: "Increase quantity of Wireless Headphones" }).click();
    await expect(page.locator(".checkout-total-final")).toHaveText("$299.97");
    await page.reload();
    await expect(page.locator(".quantity-value")).toHaveText("3");
    for (let i = 0; i < 3; i++) {
        await page.getByRole("button", { name: "Decrease quantity of Wireless Headphones" }).click();
    }
    await expect(page.getByText("Your cart is empty.", { exact: false })).toBeVisible();
    await expect(page.locator(".checkout-total-final")).toHaveText("$0.00");
    await addHeadphones(page);
    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(page.locator(".checkout-item")).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".checkout-item")).toHaveCount(0);
});

test("multiple products produce the correct combined total", async ({ page }) => {
    await addHeadphones(page);
    await page.goto("/products/2");
    await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await expect(page.locator(".checkout-item")).toHaveCount(2);
    await expect(page.locator(".checkout-total-final")).toHaveText("$349.98");
});

test("guest checkout returns through signup and clears the cart after ordering", async ({ page }) => {
    await addHeadphones(page);
    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await page.getByRole("button", { name: "Place Order" }).click();
    await expect(page.getByRole("alert")).toContainText("Please log in");
    await page.getByRole("link", { name: "Log in", exact: true }).click();
    await page.locator(".auth-switch").getByRole("button", { name: "Sign Up", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sign Up", exact: true })).toBeVisible();
    await fillAccount(page);
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.locator(".checkout-item")).toHaveCount(1);
    await page.getByRole("button", { name: "Place Order" }).click();
    await expect(page.getByRole("heading", { name: "Order Placed!" })).toBeVisible();
    await page.reload();
    await expect(page.locator(".checkout-item")).toHaveCount(0);
    await page.getByRole("button", { name: "Place Order" }).click();
    await expect(page.getByRole("alert")).toHaveText("Your cart is empty.");
});

for (const savedUsers of ["invalid json", '{"email":"wrong-shape"}', '[null,42,{"email":12}]']) {
    test(`invalid saved accounts recover safely: ${savedUsers}`, async ({ page }) => {
        await page.addInitScript((users) => {
            localStorage.setItem("users", users);
            localStorage.setItem("currentUserEmail", "missing@example.com");
        }, savedUsers);
        await page.goto("/auth");
        await expect(page.getByRole("link", { name: "Login", exact: true })).toBeVisible();
        await fillAccount(page);
        await page.getByRole("button", { name: "Sign Up", exact: true }).click();
        await expect(page.locator(".navbar-greeting")).toContainText("recruiter@example.com");
    });
}

test("invalid saved cart entries are discarded", async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem("cartItems", JSON.stringify([
            null, { id: 999, quantity: 1 }, { id: 1, quantity: -2 },
            { id: 2, quantity: "3" }, { id: 3, quantity: 1.5 }, { id: 4, quantity: 2 },
        ]));
    });
    await page.goto("/checkout");
    await expect(page.locator(".checkout-item")).toHaveCount(1);
    await expect(page.locator(".checkout-item-name")).toHaveText("Mechanical Keyboard");
    await expect(page.locator(".checkout-total-final")).toHaveText("$259.98");
});

test("blocked browser storage leaves browsing and the in-memory cart usable", async ({ page }) => {
    await page.addInitScript(() => {
        for (const method of ["getItem", "setItem", "removeItem"]) {
            Storage.prototype[method] = () => { throw new DOMException("Storage blocked", "SecurityError"); };
        }
    });
    await addHeadphones(page);
    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await expect(page.locator(".checkout-item")).toHaveCount(1);
    await page.getByRole("link", { name: "Signup", exact: true }).click();
    await fillAccount(page);
    await page.getByRole("button", { name: "Sign Up", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Browser storage is unavailable");
});

test("invalid products redirect home and unknown routes provide recovery", async ({ page }) => {
    await page.goto("/products/not-a-product");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(".product-card")).toHaveCount(8);
    await page.goto("/missing-page");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Browse products" }).click();
    await expect(page).toHaveURL(/\/$/);
});

test("mobile pages and long signed-in emails fit without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.addInitScript(() => {
        const email = `${"long".repeat(18)}@example.com`;
        localStorage.setItem("users", JSON.stringify([{ email, password: "demo123" }]));
        localStorage.setItem("currentUserEmail", email);
        localStorage.setItem("cartItems", JSON.stringify([{ id: 1, quantity: 2 }]));
    });
    for (const route of ["/", "/products/1", "/checkout", "/auth"]) {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        const dimensions = await page.evaluate(() => ({
            viewport: window.innerWidth,
            content: document.documentElement.scrollWidth,
        }));
        expect(dimensions.content, `${route} should fit the mobile viewport`).toBeLessThanOrEqual(dimensions.viewport);
    }
});

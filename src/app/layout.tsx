import "./globals.css";

export const metadata = {
    title: "Factorio BP Entity Replacer",
    description: "A tool to replace entities in your BPs",
};

export default function RootLayout({
    children,
}: {
    // eslint-disable-next-line no-undef
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}


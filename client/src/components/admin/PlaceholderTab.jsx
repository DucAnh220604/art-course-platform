import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderTab({ title, description, message }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="py-16">
          <div className="text-center text-gray-500">
            <p className="text-lg">
              {message || "Chức năng này đang được phát triển..."}
            </p>
            <p className="text-sm mt-2">Vui lòng quay lại sau.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

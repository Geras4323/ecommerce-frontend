export type CloudinarySuccess = {
  Response: {
    asset_id: string;
    public_id: string;
    api_key: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    pages: number;
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    access_mode: string;
    existing: boolean;
    original_filename: string;
  };
  error: {
    message: string | undefined;
  };
};
export type CloudinaryError = {
  Response: {
    message: string;
  };
};

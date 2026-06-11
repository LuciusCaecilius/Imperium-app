
import { getVaultById } from '@/lib/constants';
import { notFound } from 'next/navigation';
import VaultDetailClientPage from './vault-detail-client-page';

export default async function VaultDetailPage({ params: { id } }: { params: { id: string } }) {
  const vault = getVaultById(id);

  if (!vault) {
    notFound();
  }

  return (
      <VaultDetailClientPage vault={vault} />
  );
}

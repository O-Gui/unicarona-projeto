import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, spacing } from '../theme';

interface Ponto {
  lat: number;
  lng: number;
}

/**
 * Mapa gratuito: Leaflet + OpenStreetMap dentro de uma WebView, sem chave de
 * API e sem depender do mapa nativo. Mostra a origem (verde), o destino
 * (vermelho) e a rota de carro entre eles, calculada pelo OSRM público.
 * Se o OSRM falhar, fica uma linha tracejada reta entre os dois pontos.
 */
export function MapaRota({
  origem,
  destino,
  origemNome,
  destinoNome,
  altura = 240,
}: {
  origem: Ponto;
  destino: Ponto;
  origemNome?: string;
  destinoNome?: string;
  altura?: number;
}) {
  const html = useMemo(
    () => montarHtml(origem, destino, origemNome ?? 'Origem', destinoNome ?? 'Destino'),
    [origem.lat, origem.lng, destino.lat, destino.lng, origemNome, destinoNome],
  );

  return (
    <View style={[estilos.caixa, { height: altura }]}>
      <WebView
        // baseUrl dá um "referer" ao pedido dos tiles do OpenStreetMap.
        source={{ html, baseUrl: 'https://unicarona.local' }}
        originWhitelist={['*']}
        style={estilos.web}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        scrollEnabled={false}
      />
    </View>
  );
}

/** Serializa para dentro do <script> sem deixar o texto fechar a tag. */
const paraJs = (valor: unknown) => JSON.stringify(valor).replace(/</g, '\\u003c');

function montarHtml(origem: Ponto, destino: Ponto, origemNome: string, destinoNome: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #mapa { height: 100%; margin: 0; padding: 0; background: #e8eef3; }
  </style>
</head>
<body>
  <div id="mapa"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var origem = ${paraJs([origem.lat, origem.lng])};
    var destino = ${paraJs([destino.lat, destino.lng])};
    var nomeOrigem = ${paraJs(origemNome)};
    var nomeDestino = ${paraJs(destinoNome)};

    var mapa = L.map('mapa');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);

    function pino(cor) {
      return L.divIcon({
        className: '',
        html: '<div style="width:18px;height:18px;border-radius:50%;background:' + cor +
              ';border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
    }

    L.marker(origem, { icon: pino('#16a34a') }).addTo(mapa).bindPopup(nomeOrigem);
    L.marker(destino, { icon: pino('#dc2626') }).addTo(mapa).bindPopup(nomeDestino);

    mapa.fitBounds([origem, destino], { padding: [30, 30] });

    // Enquanto a rota real não chega, mostra uma linha reta tracejada.
    var linha = L.polyline([origem, destino], { color: '#F28C18', weight: 5, dashArray: '8 8' }).addTo(mapa);

    fetch('https://router.project-osrm.org/route/v1/driving/' +
          origem[1] + ',' + origem[0] + ';' + destino[1] + ',' + destino[0] +
          '?overview=full&geometries=geojson')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var pontos = j.routes[0].geometry.coordinates.map(function (p) { return [p[1], p[0]]; });
        mapa.removeLayer(linha);
        linha = L.polyline(pontos, { color: '#F28C18', weight: 5 }).addTo(mapa);
        mapa.fitBounds(linha.getBounds(), { padding: [30, 30] });
      })
      .catch(function () {});
  </script>
</body>
</html>`;
}

const estilos = StyleSheet.create({
  caixa: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.muted,
  },
  web: { flex: 1, backgroundColor: 'transparent' },
});